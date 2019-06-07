# DataPower Swagger Proxy (Swagger Validator for IBM DataPower)

IBM DataPower doesn't support validating REST API calls against a swagger document out-of-the-box (Unless you have IBM API Connect).
This piece of GatewayScript validates a request against a swagger document dynamically.

This means you can simply place this GatewayScript in you processing policy and it basically create a "REST API Proxy" that validates incoming requests against the swagger (Including headers, querystring parameters and even path parameters!).

# Implementing
In your processing policy drag a GatewayScript action and upload the JS file.
![alt text](https://raw.githubusercontent.com/dorser/dp-swagger-proxy/master/processing_policy.jpeg "MPGW Processing Policy")

Then drag a validation action and set it as described:
![alt text](https://raw.githubusercontent.com/dorser/dp-swagger-proxy/master/validation_action.jpeg "JSON Validation Action")

Upload the swagger as JSON to your local:/// directory and give it the same name as your mpgw .
For example, if you MPGW's name is `SwaggerProxyServiceA` upload your swagger to `local:///SwaggerProxyServiceA.json`

# TODO:
* Add a GatewayScript to validate responses.
* Add tests
* Latency testing
