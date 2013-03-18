var tvrager = require('tvrager'),
    res_json = require('../lib/common').res_json;


var handle_add = function(db, req, res) {
    //* TODO
    // ! get show info
    // !! insert into db
    // !!! respond ?
    // .. get episode info
    // ... insert into db
    // .... respond ?
    tvrager.getShowInfo(req.params.id, function(info) {
        if (info.error) res_json(res, info);
        else {
            db.show.insert(info, function(e, show) {
                if (e) res_json({ error: e });
                else res_json(res, show[0]);
            });
        }
    });
};

//* TODO use / remove
var handle_update = function(db, req, res) {
    tvrager.getEpisodeList(req.params.id, function(list) {
        res_json(res, list);
    });
}


//* Exports
module.exports.add = function(db) {
    return function(req, res) {
        handle_add(db, req, res);
    };
};

module.exports.main = function(db) {
    return function(req, res) {
        //* TODO
        // get full show data
        // ? auto add if nonexistent
    };
};

module.exports.remove = function(db) {
    return function(req, res) {
        db.show.remove({ 'id': req.params.id }, function(err, numRemoved) {
            if (!numRemoved == 1) console.log('WARNING: Did not remove anything.');
            res_json(res, { status: 0 });
        });
    }
};

module.exports.toggle_seen = function(db) {
    return function(req, res) {
        var q = { id: req.params.sid };
        db.show.findOne(q, function(err, doc) {
            if (err) res_json(res, { error: err });
            else if (!doc) res_json(res, { error: 'No such show.' });
            else {
                if (!doc.seasons)
                    res_json(res, { error: 'No seasons.' });
                else {
                    var episode;
                    for (var i = 0; i < doc.seasons.length; i++) {
                        for (var j = 0; j < doc.seasons[i].episodes.length; j++) {
                            if (doc.seasons[i].episodes[j].eid == req.params.eid) {
                                episode = doc.seasons[i].episodes[j]
                                if (doc.seasons[i].episodes[j].seen)
                                    delete(doc.seasons[i].episodes[j].seen);
                                else
                                    doc.seasons[i].episodes[j].seen = true;
                            }
                        };
                    };
                    db.show.update(q, { $set: { seasons: doc.seasons } },
                        function(err, count) {
                            if (err) res_json(res, { error: err });
                            else {
                                episode.show = { id: doc.id, name: doc.name };
                                res_json(res, episode);
                            }
                        });
                }
            }
        });
    }
};

//* TODO: clean
module.exports.update = function(db) {
    return function(req, res) {
        db.show.findOne({ 'id': req.params.id }, function(err, doc) {
            if (err) {
                res_json(res, { error: err })
                return;
            } else if (!doc) {
                res_json(res, { error: 'No such show.' });
                return;
            } else {
                tvrager.getEpisodeList(req.params.id, function(episodes) {
                    if (episodes.error) {
                        console.log('WARNING : Error while retrieving episode list. (%s)', episodes.error);
                        res_json(res, episodes);
                        return;
                    }
                    db.show.update({ 'id': req.params.id }, { $set: {
                        seasons: episodes.seasons } }, function(err,
                                     updateCount) {
                            if (err)
                                console.log('ERROR: Failing to update database record (%s).', err);
                            else if (updateCount == 1) {
                                db.show.findOne({ 'id': req.params.id }, function(err, doc) {
                                    if (err) res_json(res, { error: err });
                                    else if (!doc) res_json(res, { error: 'found nothing' });
                                    else res_json(res, doc);
                                });
                            } else {
                                console.log('ERROR: %s/1 record updated.',
                                    updateCount);
                                res_json(res,
                                    { error: '1 record should have been updated but ' + updateCount + ' were.' } );
                            }
                        });
                });
            }
        });
    };
};
