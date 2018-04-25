require('isomorphic-fetch'); // or another library of choice.
var express = require('express');
var {Client} = require('pg');

var app = express();
const pgClient = new Client({
	connectionString: process.env.DATABASE_URL,
});
var Dropbox = require('dropbox').Dropbox;

var port = process.env.PORT || 8080;
pgClient.connect();
var dbx = new Dropbox({ accessToken: 'uqWT_e29s8AAAAAAAAAABywpTd7Debim2zbE2fC1TjK8YYpkg13FpUKtIHsfZ-rr' });

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
		dbx.filesListFolder({path: '/apps/' + urlId})
			.then(function(res) {
				if (res.entries.length > 0) {
					dbx.filesDownload({ path: res.entries[0].path_display })
						.then(function(data) {
							response.attachment(data.name);
							response.send(data.fileBinary);
							next();
						})
						.catch(function(err) {
							console.log('nay: ' + JSON.stringify(err));
							next();
						});
				}
			})
			.catch(function(error) {
				console.log(error);
				next();
			});
	} else { // Dateiinfo
		pgClient.query("SELECT id, name, author, path FROM apps WHERE id = $1::integer LIMIT 1", [urlId], (err, res) => {		
			if (res.rowCount <= 0) {
				response.status(400);
				response.send('id nicht gefunden');
				next();
				return;
			}
			
			var resText = res.rows[0]['id'] + '\t' + res.rows[0]['name'] + '\t' + res.rows[0]['author'] + '\t' + res.rows[0]['path'] + '\n';
		
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