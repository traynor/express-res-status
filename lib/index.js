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


/**
 * turn HTTP status code reason phrase to response method
 * @param  {String} sendHandler type of response method
 * @return {Function} closure, middleware
 */
var resStatus = function resStatus() {
	var sendHandler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'json';


	// list of allowed available `res` response handlers
	var ENDHANDLERS = ['json', // equals: res.status(code).json()
	'send', // equals: res.status(code).send()
	'end', // equals: res.status(code).end()
	'none' // equals: res.status(code), no ending
	];

	// stop if end hanlder is wrong
	if (!ENDHANDLERS.includes(sendHandler.toLowerCase())) {
		throw new Error('Incorrect \'' + sendHandler + '\' sendHandler provided:, please us one of: ' + ENDHANDLERS);
	}

	// our closure middleware
	return function (req, res, next) {

		// main function that adds `res` methods
		var setUpMethodsAndCodes = function setUpMethodsAndCodes(done) {

			// get all codes info
			_codes2.default.map(function (_ref, i, arr) {
				var code = _ref.code,
				    method = _ref.method,
				    desc = _ref.desc;


				// first, attach helper methods
				if (i === 0) {

					(0, _defineProperties2.default)(res, {

						// returns all methods list array of objects
						'resStatusAll': {
							enumerable: true,
							configurable: true,
							get: function get() {
								return _codes2.default;
							}
						},
						// returns method, code, desc by status code
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

								if (!result) {
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

				// start build methods
				// we shouldn't have same methods, they can be handled later
				if (Object.prototype.hasOwnProperty.call(res, method)) {

					throw new Error('\'res\' already has method \'' + method + '\'');
				} else {

					// extend res object with new method
					// list default descriptors, for future changes
					// add reason phrase property
					(0, _defineProperty2.default)(res, method, {
						enumerable: true, // can show in {}.keys()
						configurable: true, // can edit and delete
						value: setResMethod(code, desc),
						writable: true // can reassign
					});
					// add status code property
					(0, _defineProperty2.default)(res, [code], {
						enumerable: true,
						configurable: true,
						value: setResMethod(code, desc),
						writable: true
					});
					// then, setup method's helpers
					(0, _defineProperties2.default)(res[method], {
						// returns method's code
						'code': {
							get: function get() {
								return code;
							}
						},
						// returns method's desc/full reason phrase
						'desc': {
							get: function get() {
								return desc;
							}
						}
					});
					// repeat for numeric property as well
					(0, _defineProperties2.default)(res[code], {
						'code': {
							get: function get() {
								return code;
							}
						},
						'desc': {
							get: function get() {
								return desc;
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
		// final response handler method
		var setResMethod = function setResMethod(code, desc) {

			// all methods can take body/data
			// let Express handle it for now,
			// but we'll catch err
			if (sendHandler !== 'none') {

				return function (data) {
					try {
						res.status(code)[sendHandler](data);
					} catch (err) {
						next(err);
					}
				};
			} else {
				// `none` only sets up status code
				// so you gotta finish it yourself, e.g.
				// `res.redirect(res.movedPermanently.code, '/new-location');`
				// or `res.notFound().render('404.jade', res.notFound.desc);`
				return function () {
					try {
						res.status(code);
					} catch (err) {
						next(err);
					}
				};
			}
		};

		setUpMethodsAndCodes(function () {
			next();
		});
	};
};
exports.default = resStatus;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
