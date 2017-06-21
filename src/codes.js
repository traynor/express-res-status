// pull list with http codes and desc from http
// could use `statuses` module, but it only returns
// code or desc, so lets use http

// https://github.com/nodejs/node/pull/1470
// PR `http: use official IANA Status Codes #1470`
// https://github.com/nodejs/node/blob/master/lib/_http_server.js#L40-L103
import {STATUS_CODES as codes} from 'http';

let methodsList = [];

const camelCaseString = (str) => {

	return str
		.toLowerCase()
		.replace(/\'/g, '') // words with ' will be merged
		.replace(/\W/g, ' ') // remove strange chars
		.split(' ') // split by space
		.map(function(word, i) {
			// lowercase first word to create camelCase
			// if there is just one word, lwcase it
			if (i === 0) {
				return word[0].toLowerCase() + word.substr(1);
			} else {
				return word[0].toUpperCase() + word.substr(1);
			}
		})
		.join('');
}

// crete methods arr
Object.keys(codes).forEach((key, i, arr) => {

	methodsList.push({
		method: camelCaseString(codes[key]),
		code: key,
		desc: codes[key]
	});
});


export default methodsList;
