const express = require('express');
const resStatus = require('../lib');

const app = express();

// plug-in our middleware before routes
app.use(resStatus());


app.all('/', function(req, res, next) {
	let status = req.query.status;
	//console.log(res);
	if(status) {
		try {
			res[status]({code: res[status].code, desc: res[status].desc});
		} catch(err) {
			err.message = `'${req.query.status}' method/status does not exist`;
			next(err);
		}
	} else {
		res.imATeapot('I\'m a teapot, have some tea... C(_)/¨');
	}
});

// you should have err-handler, because `resStatus`
// will pass it down the stack via `next(err)`
app.use((err, req, res, next)=> {
	// res has its usual methods
	// so you can do the usual with err
	res.internalServerError({error:err.message});
	// or
	// res.end(err.message);
})

app.listen(1337, function() {
	console.log(`Express example app running on ${this.address().port}.\nEnter '?status=ok' or '?status=200' in address bar to get 'ok' method HTTP response, or any other available method as value of 'status' key`);
});
