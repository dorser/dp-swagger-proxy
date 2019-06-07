const sm = require('service-metadata');
const hm = require('header-metadata');
const qs = require('querystring');
const fs = require('fs');

function Schema(properties,additionalProperties,required,definitions){
  this.$schema = 'http://json-schema.org/draft-04/schema#';
  this.properties = properties;
  this.additionalProperties = additionalProperties;
  this.required = required;
  this.definitions = definitions;
}

function createRequestSchemaProperty(definition,schema){
  const messagePart = definition.in;

  let parameterName = definition['name'];
  if (messagePart == 'header'){
    parameterName = parameterName.toLowerCase();
  }

  if(messagePart == 'body') {
    schema['properties']['body'] = definition.schema;
    schema['required'].push(messagePart);
  } else {

    if (!schema['properties'][messagePart]){
      schema['properties'][messagePart] = {};
      schema['properties'][messagePart]['type'] = 'object';
      schema['properties'][messagePart]['properties'] = {}
      schema['properties'][messagePart]['required'] = [];
      schema['required'].push(messagePart);
    }

    if (definition.required) {
      schema['properties'][messagePart]['required'].push(parameterName);
    }
    delete definition.name;
    delete definition.in;
    delete definition.required;
    delete definition.description;

    schema['properties'][messagePart]['properties'][parameterName] = definition;
  }


  return schema;
}

function ConvertKeysToLowerCase(obj) {
    let output = {};
    for (let key in obj) {
            output[key.toLowerCase()] = obj[key];
    }
    return output;
}

function findOperationPath(paths,uri){
	const pathParamRe = new RegExp('{.+?}','g');

	let i = 0;
	let cont = true;
	let re = new RegExp();
  let operationPath = uri;
  let possibleMatch = '';

	while (i < paths.length && cont == true) {
		re = RegExp('^' + paths[i].replace(pathParamRe,'[^\/]+') + '$','g');

		if (operationPath == paths[i]){
			cont = false;
		} else if(operationPath.match(re)){
			possibleMatch = paths[i];
		}
		i++;
	}

  if (possibleMatch && cont) {
    operationPath = possibleMatch
  } else if (cont) {
    operationPath = 'undefined';
  }

  return operationPath;
}

function getRequestParams(uri,operationPath){
	const requestParameters = {};
	const pathKeys = operationPath.split('/');
	const pathVals = uri.split('/');
	for (let i=0; i < pathKeys.length; i++){
		if (pathKeys[i].match(RegExp('{.+?}'))){
      // This is a risky assumption that if the value can be converted to a number, then we convert it to a number. Until I'll come up with a better idea :)
			// if (Number(pathVals[i])){
			// 	requestParameters[pathKeys[i].slice(1,pathKeys[i].length - 1)] = Number(pathVals[i]);
			// } else {
			// 	requestParameters[pathKeys[i].slice(1,pathKeys[i].length - 1)] = pathVals[i];
			// }
      requestParameters[pathKeys[i].slice(1,pathKeys[i].length - 1)] = pathVals[i];
		}
	}
  return requestParameters;
}

const mappingTableLocation = 'local:///route-mapping.json';

fs.readAsJSON(mappingTableLocation,(err,mappingTable) => {
  if (err){
    session.reject(err);
  } else {
    const verb = sm.getVar('var://service/protocol-method').toLowerCase();
    const uri = sm.getVar('var://service/URI');
    const resource = uri.split('?')[0];

    let route = findOperationPath(Object.keys(mappingTable['methods'][verb]),resource);

    if (route == 'undefined') {
      session.reject('This route does not exist on the server')
    }

    const swaggerLocation = mappingTable['methods'][verb][route]['schemaLocation'];
    const backendUrl = mappingTable['methods'][verb][route]['host'] + uri;

    sm.setVar('var://service/routing-url',backendUrl);

    fs.readAsJSON(swaggerLocation,(err,swagger) => {
    	if (err) {
    		session.reject('Failed to load Swagger Definition');
    	} else {

    		const basePath = swagger.basePath || '';
        const operation = uri.substring(basePath.length);
        const uriPath = operation.split('?')[0];
        const uriQuery = operation.split('?')[1];

    		const operationPath = findOperationPath(Object.keys(swagger['paths']),uriPath)

    		// Fetch the parameters declared for that operation and global parameters
    		const operationParameters = swagger['paths'][operationPath][verb]['parameters'] || [];
    		const globalParameters = swagger['parameters'];

        // Initializing the schema
    		let reqSchema = new Schema({},true,[],swagger.definitions);
    		// let resSchema = new Schema({},true,[],swagger.definitions);

        // Iterating over the paramters of the operation and building the schema of that specific operation
    		operationParameters.forEach(function(definition){
          let schemaDef = definition;
          //If the definition of the parameter is a $ref key then it's a "global" parameter. Otherwise it's a simple parameter.
    			if (definition['$ref']) {
            schemaDef = globalParameters[definition['$ref'].substring(13)]
    			}
          reqSchema = createRequestSchemaProperty(schemaDef,reqSchema);
    		})

    		// Save the schemas to a runtime variable for the validate action
    		const requestSchema = session.name('requestSchema') || session.createContext('requestSchema');
    		requestSchema.write(reqSchema);

    		// const responseSchema = session.name('responseSchema') || session.createContext('responseSchema');
    		// responseSchema.write(resSchema);

    		// Creating the unified request for validation
    		const requestParameters = getRequestParams(uriPath,operationPath);
    		const requestQuery = qs.parse(uriQuery);
    		const requestHeaders = ConvertKeysToLowerCase(hm.original.headers)
    		const request = {};
    		request.path = requestParameters;
    		request.query = requestQuery;
    		request.header = requestHeaders;

    		session.input.readAsJSON((err,json) => {
    			if (err) {
    				session.input.readAsBuffer((err,buf) => {
              if (verb != 'get' | 'head') {
                const formData = qs.parse(buf.toString());
      					request.formData = formData;
              }
    					session.output.write(request);
    				})
    			} else {
    				request.body = json;
    				session.output.write(request);
    			}
    		})
    	}
    })
  }
})
