const fs = require('fs');

var testFiles = fs.readdirSync(__dirname + '/test-specs');

const server = 'http://localhost:15000';

testFiles.forEach(function (file) {
  require('./test-specs/' + file)(server);
});
