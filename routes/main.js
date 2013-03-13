exports.index = function(db) {
    return function(req, res) {
        db.show.find().toArray(function(err, shows) {
            for (var i = 0; i < shows.length; i++)
                if (shows[i].seasons)
                    for (var j = 0; j < shows[i].seasons.length; j++)
                        if (shows[i].seasons[j].episodes)
                            for (var k = 0; k < shows[i].seasons[j].episodes.length; k++)
                                shows[i].seasons[j].episodes[k].showname = shows[i].name;
            res.render('index', { shows: shows });
        });
    };
};
