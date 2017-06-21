'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var chai = require('chai');
var agent = require('chai-http');
//const request = require('supertest');
var should = chai.should();
var expect = chai.expect;
var spies = require('chai-spies');
var express = require('express');
//const bodyParser = require('body-parser');

var resStatus = require('./..');

var app = void 0;
var codes = require('./../codes');
var specialCases = [100, 101, 102, 204, 304];

describe('resStatus middleware', function () {

	before(function (done) {
		var _this = this;

		chai.use(agent);
		chai.use(spies);

		app = express();
		//const router = app.Router();
		//app.use(bodyParser.json());
		//app.use(router);

		app.use(resStatus);

		app.all('/method/:method', function (req, res) {
			var method = req.params.method;
			res[method]({ code: res[method].code, desc: res[method].desc });
		});
		// this route is for breaking server
		// resStatus should pass it to err handler
		app.get('/err', function (req, res, next) {
			// should result in 'Converting circular structure to JSON'
			res.ok(_this);
		});
		app.use(function (err, req, res, next) {
			// res has its usual methods
			// so you can do the usual with err
			res.internalServerError({ error: err.message });
		});

		app.listen(8534, function () {
			console.log('Express server running on ' + this.address().port);
			done();
		});
	});

	describe('upon instantiating', function () {

		it('should return a function()', function (done) {
			resStatus.should.be.a('function');
			done();
		});

		it('should accept three arguments', function (done) {
			resStatus.length.should.equal(3);
			done();
		});
	});

	describe('instance', function () {

		it('should call next() once', function (done) {

			var spy = chai.spy();

			resStatus({}, {}, spy);
			expect(spy).to.have.been.called.once;
			done();
		});
		it('should return modified res object with all methods list', function (done) {
			var res = {};
			resStatus({}, res, function () {
				expect(res).to.have.property('resStatusAll');
				done();
			});
		});
		it('should have getters for code and desc on res[method]', function (done) {
			var res = {};
			resStatus({}, res, function () {
				expect(res.ok).to.have.property('code');
				expect(res.ok).to.have.property('desc');
				done();
			});
		});
		it('should have old methods on res object', function (done) {
			var res = {
				oldMethod: function oldMethod() {}
			};
			resStatus({}, res, function () {
				expect(res).to.have.property('oldMethod');
				done();
			});
		});
	});

	describe('new methods', function (done) {

		it('should all return correct status and message', function (done) {

			codes.map(function (code, i, arr) {
				if (specialCases.indexOf(+code.code) < 0) {
					chai.request(app).get('/method/' + code.method).end(function (err, res) {
						res.body.should.be.json;
						res.should.have.status(code.code);
						res.body.code.should.equal(code.code);
						res.body.desc.should.equal(code.desc);
					});
					if (i + 1 === arr.length) done();
				}
			});
		});
		it('should pass server err via next()', function (done) {
			chai.request(app).get('/err').end(function (err, res) {
				res.should.have.status(500);
				expect((0, _stringify2.default)(res.body)).to.include('error');
				done();
			});
		});
		it.skip('todo: spec cases');
	});
});