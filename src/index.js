import codes from '../lib/codes';

/**
 * turn HTTP status code reason phrase to response method
 * @param  {String} sendHandler type of response method
 * @return {Function} closure, middleware
 */
const resStatus = (sendHandler = 'json') => {

	// list of allowed available `res` response handlers
	const ENDHANDLERS = [
		'json', // equals: res.status(code).json()
		'send', // equals: res.status(code).send()
		'end', // equals: res.status(code).end()
		'none' // equals: res.status(code), no ending
	];

	// stop if end hanlder is wrong
	if (!ENDHANDLERS.includes(sendHandler.toLowerCase())) {
		throw new Error(`Incorrect '${sendHandler}' sendHandler provided:, please us one of: ${ENDHANDLERS}`);
	}

	// our closure middleware
	return (req, res, next) => {

		// main function that adds `res` methods
		const setUpMethodsAndCodes = (done) => {

			// get all codes info
			codes.map(({code, method, desc}, i, arr) => {

				// first, attach helper methods
				if (i === 0) {

					Object.defineProperties(res, {

						// returns all methods list array of objects
						'resStatusAll': {
							enumerable: true,
							configurable: true,
							get: function() {
								return codes;
							}
						},
						// returns method, code, desc by status code
						'resStatusCode': {
							enumerable: true,
							configurable: true,
							value: function(code) {

								// check if code is a string
								// else, turn code to string
								code = (typeof code === 'string' || code instanceof String)
									? code
									: String(code);

								let result;
								result = this.resStatusAll.find(object => object.code == code);

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

					throw new Error(`'res' already has method '${method}'`);

				} else {

					// extend res object with new method
					// list default descriptors, for future changes
					// add reason phrase property
					Object.defineProperty(res, method, {
						enumerable: true, // can show in {}.keys()
						configurable: true, // can edit and delete
						value: setResMethod(code, desc),
						writable: true // can reassign
					});
					// add status code property
					Object.defineProperty(res, [code], {
						enumerable: true,
						configurable: true,
						value: setResMethod(code, desc),
						writable: true
					});
					// then, setup method's helpers
					Object.defineProperties(res[method], {
						// returns method's code
						'code': {
							get: function() {
								return code;
							}
						},
						// returns method's desc/full reason phrase
						'desc': {
							get: function() {
								return desc;
							}
						}
					});
					// repeat for numeric property as well
					Object.defineProperties(res[code], {
						'code': {
							get: function() {
								return code;
							}
						},
						'desc': {
							get: function() {
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
		}
		// final response handler method
		const setResMethod = (code, desc) => {

			// all methods can take body/data
			// let Express handle it for now,
			// but we'll catch err
			if (sendHandler !== 'none') {

				return function(data) {
					try {
						res.status(code)[sendHandler](data);
					} catch (err) {
						next(err);
					}
				}
			} else {
				// `none` only sets up status code
				// so you gotta finish it yourself, e.g.
				// `res.redirect(res.movedPermanently.code, '/new-location');`
				// or `res.notFound().render('404.jade', res.notFound.desc);`
				return function() {
					try {
						res.status(code);
					} catch (err) {
						next(err);
					}
				}
			}
		}

		setUpMethodsAndCodes(() => {
			next();
		});
	}
}
export default resStatus;
