const sm = require('service-metadata');

session.input.readAsJSON((err,json) => {
  const response = {};
  response.time = new Date().toISOString();
  response.status = 'OK';

  if (sm.getVar('var://service/protocol-method').toLowerCase() == 'post') {
    response.echo = json.echo;
  }

  session.output.write(response);
})
