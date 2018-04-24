require('isomorphic-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;

var dbx = new Dropbox({ accessToken: 'uqWT_e29s8AAAAAAAAAABywpTd7Debim2zbE2fC1TjK8YYpkg13FpUKtIHsfZ-rr' });
dbx.filesListFolder({path: '/apps/4'})
	.then(function(response) {
		console.log(response);
		console.log('AAA');
		console.log(response.entries[0].path_display);
		
		dbx.filesDownload({ path: response.entries[0].path_display })
			.then(function(data) {
				console.log('hay ' + data.fileBinary.toString('utf8'));
			})
			.catch(function(err) {
				console.log('nay: ' + JSON.stringify(err));
			});
	})
	.catch(function(error) {
		console.log(error);
	});