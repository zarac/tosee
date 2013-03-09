/*
 * Uses this "API".
 * http://services.tvrage.com/info.php?page=main
 */

var http = require('http');
var xml2js = require('xml2js');
var inspect = require('eyes').inspector();

module.exports = (function() {
    return function(req, res) {
        console.log('let us find %s', req.params.name);
        http.get('http://services.tvrage.com/feeds/search.php?show=' +
            req.params.name, function(httpres) {
                var html = '';
                httpres.on('data', function(chunk) {
                    html = html + chunk;
                });
                httpres.on('end', function() {
                    console.log('html');
                    console.log(html);
                    xml2js.parseString(html, function(err, result) {
                        console.log('err:');
                        console.log(err);
                        inspect(result);
                        res.render('find', result);
                    });
                });
            });
    };
});
