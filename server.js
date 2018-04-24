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
		var resText = '';
		
		for (var i = 0; i < res.rowCount; i++) {
			resText += res.rows[i]['id'] + '\t' + res.rows[i]['name'] + '\n';
		}
		
		response.status(200);
		response.send(resText);
		next();
	});
});

app.use('/apps/:id', function(request, response, next) {
	console.log('Request to ' + request.url);
	console.log(request.params.id);
	var urlId = request.params.id;
	
	if (isNaN(urlId)) {
		response.status(400);
		response.send('falsches id format');
		next();
		return;
	}
	
	var queryParams = request.query;
	var dl = queryParams.hasOwnProperty('dl') && parseBool(queryParams.dl);
	
	if (dl) { // Datei zurückgeben
		response.send('Hello World!');
		next();
	} else { // Dateiinfo
		pgClient.query("SELECT id, name, author FROM apps WHERE id = $1::integer", [urlId], (err, res) => {		
			if (res.rowCount <= 0) {
				response.status(400);
				response.send('id nicht gefunden');
				next();
				return;
			}
			
			var resText = '';
		
			for (var i = 0; i < res.rowCount; i++) {
				resText += res.rows[i]['id'] + '\t' + res.rows[i]['name'] + '\t' + res.rows[i]['author'] + '\n';
			}
		
			response.status(200);
			response.send(resText);
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