'use strict';

var _is = require('babel-runtime/core-js/object/is');

var _is2 = _interopRequireDefault(_is);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _sourceMapSupport2 = require('source-map-support');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _sourceMapSupport2.install)();
// disable some eslint stuff here
/* eslint-disable no-negated-condition */
/* eslint-disable no-unused-vars */
/* eslint-disable no-invalid-this */
/* eslint-disable no-empty-function */
/* eslint-disable no-catch-shadow */
/* eslint-disable curly */

var chai = require('chai');
//const agent = require('chai-http');
var request = require('supertest');
/* eslint-disable no-unused-vars */
var should = chai.should();
/* eslint-enable no-unused-vars */
var expect = chai.expect;
var spies = require('chai-spies');
var express = require('express');
//const bodyParser = require('body-parser');

// fire up middleware
var resStatus = require('./..')();

var app = void 0;
var codes = require('./codes');
var specialCases = [{ method: 'continue', code: '100', desc: 'Continue' }, { method: 'switchingProtocols', code: '101', desc: 'Switching Protocols' }, { method: 'processing', code: '102', desc: 'Processing' }, { method: 'noContent', code: '204', desc: 'No Content' }, { method: 'notModified', code: '304', desc: 'Not Modified' }, { method: 'movedPermanently', code: '301', desc: 'Moved Permanently' }, { method: 'found', code: '302', desc: 'Found' }, { method: 'seeOther', code: '303', desc: 'See Other' }, { method: 'useProxy', code: '305', desc: 'Use Proxy' }, { method: 'temporaryRedirect', code: '307', desc: 'Temporary Redirect' }, { method: 'permanentRedirect', code: '308', desc: 'Permanent Redirect' }];

var noBody = ['continue', 'notModified', 'noContent', 'processing', 'switchingProtocols'];

describe('resStatus middleware', function () {

	before(function (done) {
		var _this = this;

		//chai.use(agent);
		chai.use(spies);

		app = express();
		//const router = app.Router();
		//app.use(bodyParser.json());
		//app.use(router);

		app.use(resStatus);

		app.all('/method/:method', function (req, res) {
			var method = req.params.method;
			// check for special methods
			var check = specialCases.find(function (o) {
				return o.method === method;
			});

			if (!check) {
				res[method]({
					code: res[method].code,
					desc: res[method].desc
				});
			} else {
				if (method === 'continue') {
					if (res._sent100) {
						res.ok('res._sent100');
					} else {
						res.expectationFailed();
					}
					return;
				}
				res[method]({
					code: res[method].code,
					desc: res[method].desc
				});
			}
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
			res.internalServerError({
				error: err.message
			});
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
		it('should throw err if there is already same method name', function (done) {
			var res = {
				ok: 'not ok'
			};
			expect(function () {
				resStatus({}, res, {});
			}).to.throw('\'res\' already has method \'ok\'');
			done();
		});
		it('should return modified res object with supporting methods list', function (done) {
			var res = {};
			resStatus({}, res, function () {
				expect(res).to.have.property('resStatusAll');
				expect(res).to.have.property('resStatusCode');
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
				if (!specialCases.find(function (o) {
					return o.code === code.code;
				})) {

					request(app).get('/method/' + code.method).end(function (err, res) {

						try {
							expect(res.body).to.be.an('object');
							String(res.status).should.equal(code.code);
							String(res.body.code).should.equal(code.code);
							res.body.desc.should.equal(code.desc);
						} catch (err) {
							done(err);
						}
					});

					if (i + 1 === arr.length) done();
				}
			});
		});
		it('should pass server err via next()', function (done) {
			request(app).get('/err').end(function (err, res) {
				expect(res.status).to.equal(500);
				expect((0, _stringify2.default)(res.body)).to.include('error');
				done();
			});
		});
		it('should allow to be overwritten', function (done) {
			var ok = function ok() {};
			var res = {};
			resStatus({}, res, function () {
				res.ok = ok;
				expect(res).to.have.property('ok');
				var compare = (0, _is2.default)(ok, res.ok);
				expect(compare).to.be.true;
				done();
			});
		});
		it('should handle special cases', function (done) {

			specialCases.map(function (code, i, arr) {
				if (code.method !== 'continue') {
					request(app).get('/method/' + code.method).end(function (err, res) {

						try {
							if (noBody.includes(code.method)) {
								String(res.status).should.equal(code.code);
							} else {
								expect(res.body).to.be.an('object');
								String(res.status).should.equal(code.code);
								String(res.body.code).should.equal(code.code);
								res.body.desc.should.equal(code.desc);
							}
						} catch (err) {
							done(err);
						}
					});

					if (i + 1 === arr.length) done();
				}
			});
		});

		it('should handle `continue`', function (done) {
			request(app).post('/method/continue').set('expect', '100-continue').end(function (err, res) {
				expect(res.status).not.to.eql(417);
				expect(res.body).to.eql('res._sent100');
				done();
			});
		});
	});
});
//# sourceMappingURL=integration.spec.js.map
