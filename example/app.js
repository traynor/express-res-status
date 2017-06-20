const express = require('express');
const resStatus = require('../src');

const app = express();

app.use(resStatus);

app.get('/', function (req, res, next) {

	console.log('teapot', res.imATeapot)
	res.imATeapot('I\'m a teapot, have some tea... C(_)/¨');
});


// you should have err-handler, because `resStatus`
// will pass it down the stack via `next(err)`
app.use((err, req, res, next)=> {
	// res has its usual methods
	// so you can do the usual with err
	res.end(err.message);
})

app.listen(3000, function() {
	console.log(`Express server running on ${this.address().port}`);
});
