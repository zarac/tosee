exports.index = function(db) {
    return function(req, res) {
        db.show.find().toArray(function(err, shows) {
            res.render('index', { shows: shows });
        });
    };
};
