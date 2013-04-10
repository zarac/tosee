var tvrager = require('tvrager')


module.exports = {
    tvrage : function() {
        return function(req, res) {
            tvrager.find(req.query.query, function(result) {
                var r = { finder: { query: req.query.query, result: result.result } }
                res.json(r) }) } } }
