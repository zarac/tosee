var tvrager = require('tvrager')


module.exports = {
    tvrage : function() {
        return function(req, res) {
            tvrager.find(req.query.query, function(result) {
                console.log(' === res', res)
                if (/application\/json/.test(req.headers.accept))
                    console.log('json it is..')
                var r = { finder: { query: req.query.query, result: result.result } }
                res.json(r) }) } } }
