// ********************** Initialize server **********************************

const server = require('../index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

// describe('Server!', () => {
//   // Sample test case given to test / endpoint.
//   it('Returns the default welcome message', done => {
//     chai
//       .request(server)
//       .get('/welcome')
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res.body.status).to.equals('success');
//         assert.strictEqual(res.body.message, 'Welcome!');
//         done();
//       });
//   });
// });

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// ********************************************************************************

describe('Testing Add User API', () => {
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'testname', password: "password"})
      .end((err, res) => {
        expect(res).to.have.status(302);
        res.should.be.html;
        done();
      });
  });

  it('Negative : /register. Checking empty password', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'othername', password: ""}) //no password
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.text).to.include("Please enter a username and password");

        res.should.be.html;
        done();
      });
  });
  


describe('Testing Login API', () =>{
  it('positive : /login', done => {
    chai
    .request(server)
    .post('/login')
    .send({username: "exampleuser", password: "examplepassword"})
    .end((err, res) =>{
      res.should.have.status(200);
      res.should.redirectTo(/^.*127\.0\.0\.1.*\/groups/);
      done();
    });
  });
});

  it('negative : /login. Checking incorrect password', done=>{
    chai
    .request(server)
    .post('/login')
    .send({username: "exampleuser", password: "other"}) //incorrect password
    .end((err, res) =>{
      res.should.have.status(400);
      res.should.be.html;
      done();
    });
  });
});