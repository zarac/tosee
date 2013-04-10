module.exports.html5 = function(db) {
    return function(req, res) {
        console.log(' ::: html5 user', req.user)
        console.log('/ : db =', db)
        db.show.find().toArray(function(err, shows) {
            res.render('index', { user: req.user, shows: shows });
        });
    };
};
