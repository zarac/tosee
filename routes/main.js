var inspect = require('eyes').inspector();

exports.index = function(db) {
    return function(req, res) {
        db.show.find().toArray(function(err, shows) {
            inspect(shows);
            res.render('index', { shows: shows });
        });
    };
};
