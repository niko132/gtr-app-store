var express = require('express');
var {Client} = require('pg');

var app = express();
const pgClient = new Client({
	connectionString: process.env.DATABASE_URL,
});

var port = process.env.PORT || 8080;
pgClient.connect();

app.get('/search', function(request, response, next) {
	console.log('Search Request: ' + JSON.stringify(request.query));
	var queryParams = request.query;
	var queryName = '';
	
	if (queryParams.hasOwnProperty('name')) {
		queryName = queryParams.name;
	}
	
	pgClient.query("SELECT id, name FROM apps WHERE name ~* $1::text", [queryName], (err, res) => {		
		var aaa = '';
		
		for (var i = 0; i < res.rowCount; i++) {
			aaa += res.rows[i]['id'] + '\t' + res.rows[i]['name'] + '\n';
		}
		
		response.status(200);
		response.send(aaa);
		next();
	});
});

app.use('/apps/:id', function(request, response, next) {
	console.log('Request to ' + request.url);
	console.log(request.params.id);
	var urlId = request.params.id;
	
	var queryParams = request.query;
	var dl = queryParams.hasOwnProperty('dl') && parseBool(queryParams.dl);
	
	if (dl) { // Datei zurückgeben
		response.send('Hello World!');
		next();
	} else { // Dateiinfo
		pgClient.query("SELECT id, name, author FROM apps WHERE id == $1::text", [urlId], (err, res) => {		
			var aaa = '';
			
			console.log(err.stack);
		
			for (var i = 0; i < res.rowCount; i++) {
				aaa += res.rows[i]['id'] + '\t' + res.rows[i]['name'] + '\t' + res.rows[i]['author'] + '\n';
			}
		
			response.status(200);
			response.send(aaa);
			next();
		});
	}
});

app.listen(port, function() {
	console.log('Example app listening on port ' + port);
});

var parseBool = function(str) {
	if (typeof str === 'string' && str.toLowerCase() == 'true')
		return true;
	
	return (parseInt(str) > 0);
}