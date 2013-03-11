var tvrager = require('tvrager'),
    res_json = require('../lib/common').res_json;


module.exports = (function() {
    return function(req, res) {
        tvrager.find(req.params.query, function(result) {
            res_json(res, result);
        });
    };
});
