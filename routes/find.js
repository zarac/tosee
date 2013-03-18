var tvrager = require('tvrager'),
    res_json = require('../lib/common').res_json;


module.exports = (function() {
    return function(req, res) {
        tvrager.find(req.query.query, function(result) {
            if (/application\/json/.test(req.headers.accept))
                console.log('json it is..');
            result.query = req.query.query;
            res_json(res, result);
        });
    };
});
