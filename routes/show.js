var http = require('http'),
    tvrager = require('tvrager'),
    eyes = require('eyes').inspector(),
    res_json = require('../lib/common').res_json;


module.exports.main = function(db) {
    return function(req, res) {
        /// TODO
    };
};

module.exports.remove = function(db) {
    return function(req, res) {
        db.show.remove({ 'source.id': req.params.id }, function(err, numRemoved) {
            if (!numRemoved == 1) console.log('WARNING: Did not remove anything.');
            res_json(res, { status: 0 });
        });
    }
};

module.exports.update = function(db) {
    return function(req, res) {
        db.show.findOne({ 'source.id': req.params.id }, function(err, doc) {
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
                    db.show.update({ 'source.id': req.params.id }, { $set: {
                        seasons: episodes.seasons } }, function(err,
                                     updateCount) {
                            if (err)
                                console.log('ERROR: Failing to update database record (%s).', err);
                            else if (updateCount == 1) {
                                db.show.findOne({ 'source.id': req.params.id }, function(err, doc) {
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
