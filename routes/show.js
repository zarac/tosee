var tvrager = require('tvrager');


var handle_show_add = function(db, req, res) {
    //* TODO
    // ! get show info
    // !! insert into db
    // !!! respond ?
    // .. get episode info
    // ... insert into db
    // .... respond ?
    tvrager.getShowInfo(req.params.id, function(info) {
        if (info.error) res.json(info);
        else {
            db.show.insert(info, function(e, show) {
                if (e) res.json({ error: e })
                else res.json({ show: show[0] }) }) } }) }

var handle_show_remove = function(db, req, res) {
    db.show.remove( { 'id': req.params.id }, function(err, count) {
        if (!count == 1)
            console.log('WARNING: Did not remove anything.')
        res.json( { show: { id: req.params.id, _removed: true } } ) }) }

var handle_show_update = function(db, req, res) {
    db.show.findOne( { 'id': req.params.id }, function(err, doc) {
        if (err)
            res.json( { error: err } )
        else if (!doc)
            res.json( { error: 'No such show.' } )
        else {
            tvrager.getEpisodeList(req.params.id, function(data) {
                if (data.error) {
                    console.log('WARNING : Error while retrieving episode list. (%s)',
                        data.error)
                    res.json(data) }
                else {
                    db.show.update( { 'id': req.params.id },
                        { $set: { seasons: data.seasons } },
                        function(err, count) {
                        if (err)
                            console.log('ERROR: Failing to update database record (%s).', err)
                        else if (count != 1) {
                            console.log('ERROR: %s/1 record updated.', count)
                            res.json( {
                                error: '1 record should have been updated but ' + count + ' were.'
                            } ) }
                        else {
                            db.show.findOne( { 'id': req.params.id },
                                function(err, doc) {
                                if (err) res.json( { error: err })
                                else if (!doc) res.json( { error: 'found nothing' })
                                else res.json( { show: doc } ) }) } }) } }) } }) }

var season_mark_seen = function(season) {
    for (var i = 0; i < season.episodes.length; i++)
        season.episodes[i].seen = true }

var season_mark_unseen = function(season) {
    for (var i = 0; i < season.episodes.length; i++)
        delete(season.episodes[i].seen) }

/**
 * If there's any unseen episode, mark all seen. Else, mark all unseen.
 * >
 *  boolean representing the new 'seen' status of the season.
 */
var season_toggle_seen = function(season) {
    for (var i = 0; i < season.episodes.length; i++) {
        if (!season.episodes[i].seen) {
            season_mark_seen(season)
            return true } }
    season_mark_unseen(season)
    return false }


/**
 * Exports
 */
module.exports = {
    add : function(db) {
        return function(req, res) {
            handle_show_add(db, req, res) } },

    main : function(db) {
        return function(req, res) {
            console.log('req.user = ', req.user)
            //* TODO
            // get full show info.
            // ? auto add if nonexistent
            res.json('not implemented')
            console.log('not implemented 8F0F') } },

    remove : function(db) {
        return function(req, res) {
            handle_show_remove(db, req, res) } },

    update : function(db) {
        return function(req, res) {
            handle_show_update(db, req, res) } },

    episode : {
        toggle_seen : function(db) {
            return function(req, res) {
                var q = { id: req.params.sid }
                db.show.findOne(q, function(err, doc) {
                    if (err) res.json( { error: err } )
                    else if (!doc) res.json( { error: 'No such show.' } )
                    else {
                        if (!doc.seasons)
                            res.json( { error: 'No seasons.' } )
                        else {
                            var episode, season
                            for (var i = 0; i < doc.seasons.length; i++) {
                                for (var j = 0; j <
                                    doc.seasons[i].episodes.length; j++) {
                                    if (doc.seasons[i].episodes[j].eid ==
                                        req.params.eid) {
                                        season = doc.seasons[i]
                                        episode = doc.seasons[i].episodes[j]
                                        if (doc.seasons[i].episodes[j].seen)
                                            delete(doc.seasons[i].episodes[j].seen)
                                        else
                                            doc.seasons[i].episodes[j].seen =
                                            true } } }
                            db.show.update(q, { $set: { seasons: doc.seasons } },
                                function(err, count) {
                                    if (err) res.json( { error: err } )
                                    else {
                                        episode.show = { id: doc.id, name:
                                            doc.name }
                                        episode.season = { id: season.id }
                                        res.json( { episode: episode } ) } }) } } }) } } },

    season : {
        toggle_seen : function(db) {
            return function(req, res) {
                var show = { id: req.params.sid }
                db.show.findOne(show, function(err, doc) {
                    for (var i = 0 ; i < doc.seasons.length ; i++)
                        if (doc.seasons[i].number == req.params.seid) {
                            season_toggle_seen(doc.seasons[i])
                            db.show.update( show, { $set: { seasons: doc.seasons } },
                                function(err, count) {
                                    if (err) {
                                        res.json( { error: err } )
                                        console.log('ERROR : ', err) }
                                    else {
                                        var r = { season: doc.seasons[i] }
                                        r.season.show = { id: doc.id, name: doc.name }
                                        res.json(r)
                                        console.log('doc : ', doc) } } )
                            break } } ) } } } }
