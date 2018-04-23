require('isomorphic-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;

var dbx = new Dropbox({ accessToken: 'uqWT_e29s8AAAAAAAAAABywpTd7Debim2zbE2fC1TjK8YYpkg13FpUKtIHsfZ-rr' });
dbx.filesListFolder({path: ''})
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });