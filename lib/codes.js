'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _sourceMapSupport2 = require('source-map-support');

var _http = require('http');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _sourceMapSupport2.install)(); // pull list with http codes and desc from http
// could use `statuses` module, but it only returns
// code or desc, so lets use http

// https://github.com/nodejs/node/pull/1470
// PR `http: use official IANA Status Codes #1470`
// https://github.com/nodejs/node/blob/master/lib/_http_server.js#L40-L103

var methodsList = [];

var camelCaseString = function camelCaseString(str) {

	return str.toLowerCase().replace(/\'/g, '') // words with ' will be merged
	.replace(/\W/g, ' ') // remove strange chars
	.split(' ') // split by space
	.map(function (word, i) {
		// lowercase first word to create camelCase
		// if there is just one word, lwcase it
		if (i === 0) {
			return word[0].toLowerCase() + word.substr(1);
		} else {
			return word[0].toUpperCase() + word.substr(1);
		}
	}).join('');
};

// crete methods arr
(0, _keys2.default)(_http.STATUS_CODES).forEach(function (key, i, arr) {

	methodsList.push({
		method: camelCaseString(_http.STATUS_CODES[key]),
		code: key,
		desc: _http.STATUS_CODES[key]
	});
});

exports.default = methodsList;
module.exports = exports['default'];
//# sourceMappingURL=codes.js.map
