var express = require('express');
var app = express();

var port = process.env.PORT || 8080;

app.use('/apps/', function(req, res, next) {
	console.log('Request to ' + req.url);
	res.send('Hello World!');
	next();
});

app.listen(port, function() {
	console.log('Example app listening on port ' + port);
});