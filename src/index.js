import codes from '../lib/codes';

const resStatus = (req, res, next) => {

	const setUpMethodsAndCodes = (done) => {

		codes.map((code, i, arr) => {

			// attach methods list as getter
			if (i === 0) {
				Object.defineProperty(res, 'resStatusAll', {
							get: function() {
								return codes;
							}
						});
			}

			// we shouldn't have same methods
			if (Object.prototype.hasOwnProperty.call(res, code.method)) {

				throw new Error(`'res' already has method '${code.method}'`);

			} else {

				// extend res object with new methods
				Object.defineProperty(res, code.method, {
					enumerable: true, // can show in {}.keys()
					configurable: true, // can delete
					value: setResMethod(code.code, code.desc),
					writable: true // can reassign
				});
				// ugly way attach code and desc getters
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
