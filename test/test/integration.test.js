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
const codes = require('./../codes');
const specialCases = [
	100,
	101,
	102,
	204,
	304
];

describe('resStatus middleware', function() {

	before(function(done) {

		chai.use(agent);
		chai.use(spies);

		app = express();
		//const router = app.Router();
		//app.use(bodyParser.json());
		//app.use(router);

		app.use(resStatus);

		app.all('/method/:method', function(req, res) {
			let method = req.params.method;
			res[method]({code: res[method].code, desc: res[method].desc});
		});
		// this route is for breaking server
		// resStatus should pass it to err handler
		app.get('/err', (req, res, next)=> {
			// should result in 'Converting circular structure to JSON'
			res.ok(this);
		})
		app.use((err, req, res, next) => {
			// res has its usual methods
			// so you can do the usual with err
			res.internalServerError({error:err.message});
		})

		app.listen(8534, function() {
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
		it('should throw err if there is already same method name', function(done) {
			let res = {ok:'not ok'};
			expect(function() {
				resStatus({}, res, {});
			}).to.throw(`'res' already has method 'ok'`);
			done();
		});
		it('should return modified res object with supporting methods list', function(done) {
			let res = {};
			resStatus({}, res, ()=> {
				expect(res).to.have.property('resStatusAll');
				expect(res).to.have.property('resStatusCode');
				done();
			});
		});
		it('should have getters for code and desc on res[method]', function(done) {
			let res = {};
			resStatus({}, res, ()=> {
				expect(res.ok).to.have.property('code');
				expect(res.ok).to.have.property('desc');
				done();
			});
		});
		it('should have old methods on res object', function(done) {
			let res = {
				oldMethod() {}
			};
			resStatus({}, res, () => {
				expect(res).to.have.property('oldMethod');
				done();
			});
		});
	});

	describe('new methods', function(done) {

		it('should all return correct status and message', function(done) {

			codes.map((code, i, arr) => {
				if(specialCases.indexOf(+code.code) < 0) {
					chai.request(app)
						.get(`/method/${code.method}`)
						.end(function(err, res) {
							res.body.should.be.json;
							res.should.have.status(code.code);
							res.body.code.should.equal(code.code);
							res.body.desc.should.equal(code.desc);
						});
						if(i+1 === arr.length) done();
				}
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
		it.skip('todo: spec cases');
	});

});
