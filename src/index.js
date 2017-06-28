import codes from '../lib/codes';

const resStatus = (req, res, next) => {

	const setUpMethodsAndCodes = (done) => {

		codes.map((code, i, arr) => {

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
							if(result === undefined) {
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

				throw new Error(`'res' already has method '${code.method}'`);

			} else {

				// extend res object with new method
				// list default descriptors for future changes
				Object.defineProperty(res, code.method, {
					enumerable: true, // can show in {}.keys()
					configurable: true, // can edit and delete
					value: setResMethod(code.code, code.desc),
					writable: true // can reassign
				});
				// then, attach method's code and desc getters
				Object.defineProperties(res[code.method], {
						'code': {
						get: function() { return code.code; }
					},
						'desc': {
						get: function() { return code.desc; }
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

		return function (data) {
			try {
				res.status(code).json(data);
			} catch (err) {
				next(err);
			}
		}
	}

	setUpMethodsAndCodes(() => {
		next();
	});
}

export default resStatus;
