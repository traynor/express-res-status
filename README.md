# express-res-status
Extends `res` object with semantic method that correspondes to description/message/reason phrase associated with HTTP status code, thus shortening sending HTTP response by using self descriptive methods instead of codes and forcing usage of human readable part of HTTP statuses and adding more meaning to REST API.

# Under the hood

Methods are built on top of Express methods `.json()`, `.send()`, `.end()`, so you can treat them the same.

So, invoking a method, e.g  `res.ok(data)`, is the same as doing `res.status(200).json(data)`.

If there is an err in the middleware, it will be passed down the stack (calling `next(err)`), so you can place your err-handler at the end and handle the err.

It uses Node.JS' built-in module `http`, namely, its `STATUS_CODES` object, from which it creates methods from description property, and assigns(defines, actually) them to `res` object.

Why `http`?

`http` exports list in a nice, code-desc format, it comes with Node.JS, and parsing from other sources could be planned for some later upgrade

# Usage

Use any [standard](https://github.com/nodejs/node/blob/master/lib/_http_server.js#L40-L103) (cannot use custom codes) HTTP code's description/message/reason phrase in a camelCase format, for example:

`418 I'm a teapot`

would be used as:

`res.imATeapot('I\'m a teapot, have some tea... C(_)/¨');`

and, instead of:

`res.status(200).json(data);`

you have:

`res.ok(data);`

and instead of:

`res.status(404).json(errMsg);`

you have:

`res.notFound(errMsg);`

etc.

But, if you still prefer codes, you can use codes as methods:

`res[404](errMsg);`

or

`res[500](errMsg);`

etc.


Example usage:

```javascript
import {Router} from 'express';
import {resStatus} from 'express-res-status';

const route = Router();

// plug-in middleware before your routes
// .json() handler is default,
// pass 'send', 'end' or 'none' to use them,
// read further for explanation
route.use(resStatus());

route.get('/some-api', (req, res, next) => {
		
		if (somethingBackendWise) {

			// return 200 OK + payload
			res.ok(data); // equals: res.status(200).json(data);

		} else {

			// return 404 Not Found + errMsg
			res.notFound(errMsg); // equals: res.status(404).json(errMsg);
		}
	});
	// etc.
```

## Setting response end handlers

You can chose one of Express' response handlers by providing one of the options as `endHandler` argument:

-	`json`: default, to use `.json()`, equals: `res.status(code).json(body);`
-	`send`: to use `.send()`, equals: `res.status(code).send(body);`
-	`end`: to use `.end()`, equals: `res.status(code).end(body);`
-	`none`: to only set up status code, it doesn't end response, equals: `res.status(code);`

usage:
```javascript
// to use `.send()`, pass 'send' as an arg
// when setting up middleware
app.use(resStatus('send'));
//...and in routes:
res.notFound('whatever you usually send to res.send()');
```
or

```javascript
// use your own way
app.use(resStatus('none'));
//...
// not really handy, but still
res.notFound().render('404', {msg: res.notFound.desc});

```

## Middleware helper methods

- `res.resStatusAll` - lists all available methods with code and desc
- `res.resStatusCode(code);` - returns code and description for provided code (code param can be `Number` or `String`)

example:
```javascript
res.resStatusAll; // array with `{method, code, desc}` fromat
res.resStatusCode(400); //{ method: 'badRequest', code: '400', desc: 'Bad Request' }
// ...and if code is not found...
res.resStatusCode(1337)) // { error: 'No such code' }
```

## res[method] helper methods

- `res.[method].code` - gets specific method's HTTP code
- `res.[method].desc` - gets specific method's HTTP description

example:
```javascript
res.ok.code; // 200
res.ok.desc; // 'OK'
```

## Example

See also full [full example](example/app.js)

# run example locally

```bash
npm i
npm start
```

Visit: <http://localhost:1337>

Enter `?status=ok`' or `?status=200` in address bar to get `ok` method HTTP response, or any other available method as value of `status` key, as a string or number.


## Methods list

Besides using `res.resStatusAll`:

For (fresh) full list of methods: <https://github.com/nodejs/node/blob/master/lib/_http_server.js#L40-L103>


# develop
```bash
npm i
gulp
```

# todo

- [ ] add html and xml handlers
- [ ] add tests for the rest of end handlers
- [ ] handle special cases (like some 1xx, 3xx etc.)
- [ ] fix linting


# dump of methods list at the time of creating readme

| `res[method]` | Code |  Desc/reason phrase |
|---------------|------|-------|
|  res.continue(); | 100 |Continue |
|  res.switchingProtocols(); | 101 |Switching Protocols |
|  res.processing(); | 102 |Processing |
|  res.ok(); | 200 |OK |
|  res.created(); | 201 |Created |
|  res.accepted(); | 202 |Accepted |
|  res.nonAuthoritativeInformation(); | 203 |Non-Authoritative Information |
|  res.noContent(); | 204 |No Content |
|  res.resetContent(); | 205 |Reset Content |
|  res.partialContent(); | 206 |Partial Content |
|  res.multiStatus(); | 207 |Multi-Status |
|  res.alreadyReported(); | 208 |Already Reported |
|  res.imUsed(); | 226 |IM Used |
|  res.multipleChoices(); | 300 |Multiple Choices |
|  res.movedPermanently(); | 301 |Moved Permanently |
|  res.found(); | 302 |Found |
|  res.seeOther(); | 303 |See Other |
|  res.notModified(); | 304 |Not Modified |
|  res.useProxy(); | 305 |Use Proxy |
|  res.temporaryRedirect(); | 307 |Temporary Redirect |
|  res.permanentRedirect(); | 308 |Permanent Redirect |
|  res.badRequest(); | 400 |Bad Request |
|  res.unauthorized(); | 401 |Unauthorized |
|  res.paymentRequired(); | 402 |Payment Required |
|  res.forbidden(); | 403 |Forbidden |
|  res.notFound(); | 404 |Not Found |
|  res.methodNotAllowed(); | 405 |Method Not Allowed |
|  res.notAcceptable(); | 406 |Not Acceptable |
|  res.proxyAuthenticationRequired(); | 407 |Proxy Authentication Required |
|  res.requestTimeout(); | 408 |Request Timeout |
|  res.conflict(); | 409 |Conflict |
|  res.gone(); | 410 |Gone |
|  res.lengthRequired(); | 411 |Length Required |
|  res.preconditionFailed(); | 412 |Precondition Failed |
|  res.payloadTooLarge(); | 413 |Payload Too Large |
|  res.uriTooLong(); | 414 |URI Too Long |
|  res.unsupportedMediaType(); | 415 |Unsupported Media Type |
|  res.rangeNotSatisfiable(); | 416 |Range Not Satisfiable |
|  res.expectationFailed(); | 417 |Expectation Failed |
|  res.imATeapot(); | 418 |I\'m a teapot |
|  res.misdirectedRequest(); | 421 |Misdirected Request |
|  res.unprocessableEntity(); | 422 |Unprocessable Entity |
|  res.locked(); | 423 |Locked |
|  res.failedDependency(); | 424 |Failed Dependency |
|  res.unorderedCollection(); | 425 |Unordered Collection |
|  res.upgradeRequired(); | 426 |Upgrade Required |
|  res.preconditionRequired(); | 428 |Precondition Required |
|  res.tooManyRequests(); | 429 |Too Many Requests |
|  res.requestHeaderFieldsTooLarge(); | 431 |Request Header Fields Too Large |
|  res.unavailableForLegalReasons(); | 451 |Unavailable For Legal Reasons |
|  res.internalServerError(); | 500 |Internal Server Error |
|  res.notImplemented(); | 501 |Not Implemented |
|  res.badGateway(); | 502 |Bad Gateway |
|  res.serviceUnavailable(); | 503 |Service Unavailable |
|  res.gatewayTimeout(); | 504 |Gateway Timeout |
|  res.httpVersionNotSupported(); | 505 |HTTP Version Not Supported |
|  res.variantAlsoNegotiates(); | 506 |Variant Also Negotiates |
|  res.insufficientStorage(); | 507 |Insufficient Storage |
|  res.loopDetected(); | 508 |Loop Detected |
|  res.bandwidthLimitExceeded(); | 509 |Bandwidth Limit Exceeded |
|  res.notExtended(); | 510 |Not Extended |
|  res.networkAuthenticationRequired(); | 511 |Network Authentication Required |

# License
MIT
