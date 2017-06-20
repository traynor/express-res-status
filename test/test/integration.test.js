const chai = require('chai');
const agent = require('chai-http');
//const request = require('supertest');
const should = chai.should();
const expect =  chai.expect;
const spies = require('chai-spies');
const express = require('express');
//const bodyParser = require('body-parser');

const resStatus = require('./..');
console.log(resStatus)
let app;

describe('resStatus middleware', function() {

	before(function(done) {

		chai.use(agent);
		chai.use(spies);

		app = express();
		//const router = app.Router();
		//app.use(bodyParser.json());
		//app.use(router);

		app.use(resStatus);

		app.get('/', function(req, res) {
			res.ok('ok');
		});
		app.get('/418', function(req, res) {
			res.imATeapot({msg:'imATeapot'});
		});
		app.listen(1337, function() {
			console.log(`Express server running on ${this.address().port}`);
			done();
		});
	});

  describe('upon instantiating', function() {

    it('should return a function()', function(done) {
      resStatus.should.be.a('function')
      done();
    });

    it('should accept three arguments', function(done) {
      resStatus.length.should.equal(3);
      done();
    });
  });

	describe('upon calling', function() {

		it('should call next() once', function(done) {

			const spy = chai.spy();

			resStatus({}, {}, spy);
			expect(spy).to.have.been.called.once;
			done();
		});
		it('should return modified res object', function(done) {
			let res = {};
			resStatus({}, res, ()=> {
				expect(res).to.have.property('ok');
				done();
			});
		});
		it('should have old methods on res object', function(done) {
			let res = {oldMethod(){}};
			resStatus({}, res, ()=> {
				expect(res).to.have.property('oldMethod');
				done();
			});
		});
	});

	describe('calling method', function(done) {

		it('.ok should get 200', function(done) {
			chai.request(app)
				.get('/')
				.end(function(err, res) {
					res.should.have.status(200);
					done();
				});
		});
		it('.imATeapot should get 418', function(done) {
			chai.request(app)
				.get('/418')
				.end(function(err, res) {
					res.should.have.status(418);
					done();
				});
		});
	});

});
