const resStatus = (req, res, next) => {


	// https://github.com/nodejs/node/pull/1470
	// `http: use official IANA Status Codes #1470`
	// https://github.com/nodejs/node/blob/master/lib/_http_server.js#L40-L103
	const http = require('http');
	const codes = http.STATUS_CODES;

	let methodsList = [];

	const setUpMethodsAndCodes = (done) => {

		Object.keys(codes).forEach((key, i, arr) => {

			methodsList.push({
						[camelCaseString(codes[key])]: {
							code: key,
							desc: codes[key]
						}
					});

			let statusMethod = camelCaseString(codes[key]);

			// we shouldn't have same methods
			if (Object.prototype.hasOwnProperty.call(res, statusMethod)) {

				throw new Error(`'res' already has method '${statusMethod}'`);

			} else {

				// extend res object with new methods
				Object.defineProperty(res, statusMethod, {
					enumerable: true, // can show in {}.keys()
					configurable: true, // can delete
					value: setResMethod(key, codes[key]),
					writable: true // can reassign
				});
			}
			// or could call next(), it's in scope
			if (i + 1 === arr.length) {
				done();
			}
		});
	}

	const setResMethod = (code, desc) => {

		return function (data) {
			try {
				res.status(code).json(data);
			} catch (err) {
				next(err);
			}
		}
	}

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

	setUpMethodsAndCodes(() => {
		next();
	});
}

export default resStatus;
