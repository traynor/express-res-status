
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
	// etc.
```

It only supports `res.json()`, you can still use `res` object's methods in special cases, like err handling.

See also full [full example](example/app.js)

For full list of methods: <https://github.com/nodejs/node/blob/master/lib/_http_server.js#L40-L103>

# Under the hood

It uses Node.JS' built-in module `http`, namely, its `STATUS_CODES` object, from which module creates methods from description property, and assigns(defines, actually) them to `res` object.

Method is a function that takes `data` as an argument, and calls `res.status(status).json(data)` when invoked, so it is fully treated like `res.json()`.

It then passes `res` down the stack by calling `next()`.

If there is an err in the middleware, it will bi passed to the next middleware (`next(err)`), so you should place your err-handler at the end and handle the err.

# run example locally
just install Express, else is for dev
```bash
npm i express
gulp build
npm start
```

Visit: <http://localhost:3000>

# develop
```bash
npm i
gulp build
gulp
```
# dump of methods list at the time of creating readme

| `res` method] | Code |  Desc |
|---------------|------|-------|
|  continue | 100 |Continue |
|  switchingProtocols | 101 |Switching Protocols |
|  processing | 102 |Processing |
|  ok | 200 |OK |
|  created | 201 |Created |
|  accepted | 202 |Accepted |
|  nonAuthoritativeInformation | 203 |Non-Authoritative Information |
|  noContent | 204 |No Content |
|  resetContent | 205 |Reset Content |
|  partialContent | 206 |Partial Content |
|  multiStatus | 207 |Multi-Status |
|  alreadyReported | 208 |Already Reported |
|  imUsed | 226 |IM Used |
|  multipleChoices | 300 |Multiple Choices |
|  movedPermanently | 301 |Moved Permanently |
|  found | 302 |Found |
|  seeOther | 303 |See Other |
|  notModified | 304 |Not Modified |
|  useProxy | 305 |Use Proxy |
|  temporaryRedirect | 307 |Temporary Redirect |
|  permanentRedirect | 308 |Permanent Redirect |
|  badRequest | 400 |Bad Request |
|  unauthorized | 401 |Unauthorized |
|  paymentRequired | 402 |Payment Required |
|  forbidden | 403 |Forbidden |
|  notFound | 404 |Not Found |
|  methodNotAllowed | 405 |Method Not Allowed |
|  notAcceptable | 406 |Not Acceptable |
|  proxyAuthenticationRequired | 407 |Proxy Authentication Required |
|  requestTimeout | 408 |Request Timeout |
|  conflict | 409 |Conflict |
|  gone | 410 |Gone |
|  lengthRequired | 411 |Length Required |
|  preconditionFailed | 412 |Precondition Failed |
|  payloadTooLarge | 413 |Payload Too Large |
|  uriTooLong | 414 |URI Too Long |
|  unsupportedMediaType | 415 |Unsupported Media Type |
|  rangeNotSatisfiable | 416 |Range Not Satisfiable |
|  expectationFailed | 417 |Expectation Failed |
|  imATeapot | 418 |I\'m a teapot |
|  misdirectedRequest | 421 |Misdirected Request |
|  unprocessableEntity | 422 |Unprocessable Entity |
|  locked | 423 |Locked |
|  failedDependency | 424 |Failed Dependency |
|  unorderedCollection | 425 |Unordered Collection |
|  upgradeRequired | 426 |Upgrade Required |
|  preconditionRequired | 428 |Precondition Required |
|  tooManyRequests | 429 |Too Many Requests |
|  requestHeaderFieldsTooLarge | 431 |Request Header Fields Too Large |
|  unavailableForLegalReasons | 451 |Unavailable For Legal Reasons |
|  internalServerError | 500 |Internal Server Error |
|  notImplemented | 501 |Not Implemented |
|  badGateway | 502 |Bad Gateway |
|  serviceUnavailable | 503 |Service Unavailable |
|  gatewayTimeout | 504 |Gateway Timeout |
|  httpVersionNotSupported | 505 |HTTP Version Not Supported |
|  variantAlsoNegotiates | 506 |Variant Also Negotiates |
|  insufficientStorage | 507 |Insufficient Storage |
|  loopDetected | 508 |Loop Detected |
|  bandwidthLimitExceeded | 509 |Bandwidth Limit Exceeded |
|  notExtended | 510 |Not Extended |
|  networkAuthenticationRequired | 511 |Network Authentication Require ||
