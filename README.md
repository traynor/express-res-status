
Middleware that extends Express' `res` object by wrapping `res.status().json()` into a semantic method that correspondes to HTTP status code description, which are pulled out from Node.JS' `http` module's `STATUS_CODES`.

so, instead of:

`res.status(200).json(data);`

you'd have:

`res.ok(data);`

and instead of:

`res.status(404).json(errMsg);`

you'd have:

`res.notFound(errMsg);`

Basically, instead of codes, you use HTTP code description in camelCase format, like so:

`418 I'm a teapot`

would be:

`res.imATeapot('I\'m a teapot, have some tea... C(_)/¨');`



Example usage:

```javascript
import {Router} from 'express';
import {resStatus} from 'express-res-status';

const route = Router();

// plug-in middleware before your routes
route.use(resStatus);

route.route('/some-route')
	.all(() => { /* some usual method */ }))
	.get((req, res, next) => {
		if (someValidation) {
			// ...
			// do something backend-wise
			// ...
			// return data
			res.ok(data); // equals: res.status(200).json(data);
		} else {
			// return 404 error
			res.notFound(errMsg); // equals: res.status(404).json(errMsg);
		}
	});
```

It only supports `res.json()`, you can still use `res` object's methods in special cases, like err handling.

See also full [full example](example/app.js)

For full list of methods: https://github.com/nodejs/node/blob/master/lib/_http_server.js#L40-L103

# Under the hood

It uses Node.JS' built-in module `http`, namely, its `STATUS_CODES` object, from which module creates methods from description property, and assigns(defines, actually) them to `res` object.

Method is a function that takes `data` as an argument, and calls `res.status(status).json(data)` when invoked, so it is fully treated like `res.json()`.

It then passes `res` down the stack by calling `next()`.

If there is an err in the middleware, it will bi passed to the next middleware (`next(err)`), so you should place your err-handler at the end and handle the err.

# Installation
```bash
gulp build
npm start
```

# develop
```bash
gulp build
gulp
```
