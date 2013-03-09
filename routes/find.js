/*
 * Uses RSS feeds from tvrage
 *  http://services.tvrage.com/info.php?page=main
 */

var http = require('http');
var xml2js = require('xml2js');
var inspect = require('eyes').inspector();

module.exports = (function() {
    return function(req, res) {
        process.stdout.write('Let us find "' + req.params.name + '" ');
        http.get('http://services.tvrage.com/feeds/search.php?show=' +
            req.params.name, function(httpres) {
                var html = '';

                httpres.on('data', function(chunk) {
                    process.stdout.write('.');
                    html = html + chunk;
                });

                httpres.on('end', function() {
                    process.stdout.write('\n');
                    xml2js.parseString(html, function(err, result) {
                        if (err) console.log('ERROR: %s', err);
                        result.query = req.params.name;
                        inspect(result);
                        res.render('find', result);
                    });
                });
            }).on('error', function(e) {
                console.log('ERROR: %s', e);
                res.render('find', { error: e.message });
            });
    };
});
