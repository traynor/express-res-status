'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _codes = require('../lib/codes');

var _codes2 = _interopRequireDefault(_codes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var resStatus = function resStatus(req, res, next) {

	var setUpMethodsAndCodes = function setUpMethodsAndCodes(done) {

		_codes2.default.map(function (code, i, arr) {

			// attach methods list as getter
			if (i === 0) {
				Object.defineProperty(res, 'resStatusAll', {
					get: function get() {
						return _codes2.default;
					}
				});
			}

			// we shouldn't have same methods
			if (Object.prototype.hasOwnProperty.call(res, code.method)) {

				throw new Error('\'res\' already has method \'' + code.method + '\'');
			} else {

				// extend res object with new methods
				(0, _defineProperty2.default)(res, code.method, {
					enumerable: true, // can show in {}.keys()
					configurable: true, // can delete
					value: setResMethod(code.code, code.desc),
					writable: true // can reassign
				});
				// very ugly way to add code and desc getters
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
			// or could call next(), it's in scope
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