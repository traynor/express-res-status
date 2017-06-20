const chai = require('chai');
const agent = require('chai-http');
//const request = require('supertest');
const should = chai.should();
const expect =  chai.expect;
const spies = require('chai-spies');
const express = require('express');
//const bodyParser = require('body-parser');

const resStatus = require('./..');

let app;
const methods = require('./methods-list');

describe('resStatus middleware', function() {

	before(function(done) {

		chai.use(agent);
		chai.use(spies);

		app = express();
		//const router = app.Router();
		//app.use(bodyParser.json());
		//app.use(router);

		app.use(resStatus);

		// this route is for breaking server
		// resStatus should pass it to err handler
		app.get('/err', (req, res, next)=> {
			// should result in 'Converting circular structure to JSON'
			res.ok(this);
		})

		app.all('/:method', function(req, res) {
			let method = req.params.method;
			res[method](method);
		});

		app.use((err, req, res, next) => {
			// res has its usual methods
			// so you can do the usual with err
			res.internalServerError({error:err.message});
		})

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

	describe('instance', function() {

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

	describe('new methods', function(done) {

		it('should all return correct status and json message', function(done) {

			methods.forEach((method, i, arr) => {
				chai.request(app)
					.get('/'+Object.keys(method))
					.end(function(err, res) {
						res.should.have.status(Object.values(method)[0].code);
						res.body.should.be.json;
					});

					if(i+1 === arr.length) done();
			})
		});
		it('should pass server err via next()', function(done) {
				chai.request(app)
					.get('/err')
					.end(function(err, res) {
						res.should.have.status(500);
						expect(JSON.stringify(res.body)).to.include('error');
						done();
					});
		});
	});

});
