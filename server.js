var express = require('express');
var {Client} = require('pg');

var app = express();
const pgClient = new Client({
	connectionString: process.env.DATABASE_URL,
});

var port = process.env.PORT || 8080;
pgClient.connect();

app.get('/search', function(req, res, next) {
	console.log('Search Request: ' + JSON.stringify(req.query));
	var queryParams = req.query;
	var queryName = '';
	
	if (queryParams.hasOwnProperty('name')) {
		queryName = queryParams.name;
	}
	
	pgClient.query("SELECT * FROM apps", (err, res) => {
		console.log('Query: ' + res.rows.length);
		
		res.status(200);
		res.send('Searching ' + queryName);
		next();
	});
});

app.use('/apps/', function(req, res, next) {
	console.log('Request to ' + req.url);
	res.send('Hello World!');
	next();
});

app.listen(port, function() {
	console.log('Example app listening on port ' + port);
});