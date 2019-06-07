const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

module.exports = function(server) {
  chai.use(chaiHttp);
  describe('Health Check', () => {
    describe('GET /health-check/v1/echo', () => {
      it('get an OK response', (done) => {
        chai.request(server)
          .get('/health-check/v1/echo')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('time');
            res.body.should.have.property('status');
            res.body.status.should.be.eql('OK');
            done();
          });
      });
    });
    describe('POST /health-check/v1/echo', () => {
      it('get an OK response', (done) => {
        const echoRequest = {
          echo: {
            message: 'hello!'
          }
        };
        chai.request(server)
          .post('/health-check/v1/echo')
          .send(echoRequest)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('time');
            res.body.should.have.property('status');
            res.body.should.have.property('echo');
            res.body.echo.should.be.eql(echoRequest.echo);
            res.body.status.should.be.eql('OK');
            done();
          });
      });
    });
  });
}
