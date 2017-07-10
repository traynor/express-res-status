import codes from '../lib/codes';

/**
 * turn HTTP status code reason phrase to response method
 * @param  {String} sendHandler type of response method
 * @return {Function} closure, middleware
 */
const resStatus = (sendHandler = 'json') => {

	const ENDHANDLERS = ['json', 'send', 'end', 'none'];

	if (!ENDHANDLERS.includes(sendHandler.toLowerCase())) {
		throw new Error(`Illegal '${sendHandler}' sendHandler provided:, please us one of: ${ENDHANDLERS}`);
	}

	return (req, res, next) => {

		const setUpMethodsAndCodes = (done) => {

			codes.map(({code, method, desc}, i, arr) => {

				// first, attach methods list as getter
				if (i === 0) {

					Object.defineProperties(res, {
						'resStatusAll': {
							enumerable: true,
							configurable: true,
							get: function() {
								return codes;
							}
						},
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

				// we shouldn't have same methods
				if (Object.prototype.hasOwnProperty.call(res, method)) {

					throw new Error(`'res' already has method '${method}'`);

				} else {

					// extend res object with new method
					// list default descriptors for future changes
					Object.defineProperty(res, method, {
						enumerable: true, // can show in {}.keys()
						configurable: true, // can edit and delete
						value: setResMethod(code, desc),
						writable: true // can reassign
					});
					// then, attach method's code and desc getters
					Object.defineProperties(res[method], {
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

		const setResMethod = (code, desc) => {

			// all methods take body
			// you gotta watch the type
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
				// you gotta finish it yourself
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
