'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _sourceMapSupport2 = require('source-map-support');

var _codes = require('../lib/codes');

var _codes2 = _interopRequireDefault(_codes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _sourceMapSupport2.install)();


var resStatus = function resStatus(req, res, next) {

	var setUpMethodsAndCodes = function setUpMethodsAndCodes(done) {

		_codes2.default.map(function (code, i, arr) {

			// first, attach methods list as getter
			if (i === 0) {

				(0, _defineProperties2.default)(res, {
					'resStatusAll': {
						enumerable: true,
						configurable: true,
						get: function get() {
							return _codes2.default;
						}
					},
					'resStatusCode': {
						enumerable: true,
						configurable: true,
						value: function value(code) {

							// check if code is a string
							// else, turn code to string
							code = typeof code === 'string' || code instanceof String ? code : String(code);

							var result = void 0;
							result = this.resStatusAll.find(function (object) {
								return object.code == code;
							});
							if (result === undefined) {
								return {
									error: 'No such code'
								};
							} else {
								return result;
							}
						},
						writable: true
					}
				});
			}

			// we shouldn't have same methods
			if (Object.prototype.hasOwnProperty.call(res, code.method)) {

				throw new Error('\'res\' already has method \'' + code.method + '\'');
			} else {

				// extend res object with new method
				// list default descriptors for future changes
				(0, _defineProperty2.default)(res, code.method, {
					enumerable: true, // can show in {}.keys()
					configurable: true, // can edit and delete
					value: setResMethod(code.code, code.desc),
					writable: true // can reassign
				});
				// then, attach method's code and desc getters
				(0, _defineProperties2.default)(res[code.method], {
					'code': {
						get: function get() {
							return code.code;
						}
					},
					'desc': {
						get: function get() {
							return code.desc;
						}
					}
				});
			}
			// or could call next(), it's in a scope
			if (i + 1 === arr.length) {
				done();
			}
		});
	};

	var setResMethod = function setResMethod(code, desc) {

		return function (data) {
			try {
				res.status(code).json(data);
			} catch (err) {
				next(err);
			}
		};
	};

	setUpMethodsAndCodes(function () {
		next();
	});
};

exports.default = resStatus;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
