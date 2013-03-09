/*
 * Uses RSS feeds from tvrage
 *  http://services.tvrage.com/info.php?page=main
 *
 * Search   • http://services.tvrage.com/feeds/search.php?show=SHOWNAME
 *  Detailed Search  • http://services.tvrage.com/feeds/full_search.php?show=SHOWNAME
 *  Show Info    • http://services.tvrage.com/feeds/showinfo.php?sid=SHOWID
 *  Episode List • http://services.tvrage.com/feeds/episode_list.php?sid=SHOWID
 *  Episode Info • http://services.tvrage.com/feeds/episodeinfo.php?show=Show Name&exact=1&ep=SEASONxEPISODE
 *  Show Info + Episode List • http://services.tvrage.com/feeds/full_show_info.php?sid=SHOWID
 *  Full Show List   • http://services.tvrage.com/feeds/show_list.php
 *
 * XML Example For Buffy The Vampire Slayer
 *  Search   http://services.tvrage.com/feeds/search.php?show=buffy
 *  Detailed Search  http://services.tvrage.com/feeds/full_search.php?show=buffy
 *  Show Info    http://services.tvrage.com/feeds/showinfo.php?sid=2930
 *  Episode List http://services.tvrage.com/feeds/episode_list.php?sid=2930
 *  Show Info + Episode List http://services.tvrage.com/feeds/full_show_info.php?sid=2930
 *  Episode Info http://services.tvrage.com/feeds/episodeinfo.php?sid=2930&ep=2x04
 */

var http = require('http');
var xml2js = require('xml2js');
var inspect = require('eyes').inspector();

module.exports = (function() {
    return function(req, res) {
        process.stdout.write('Let us find "' + req.params.name + '" ');
        http.get('http://services.tvrage.com/feeds/full_search.php?show=' +
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
