module.exports = function(db) {
    return function(req, res) {
        //* TODO: clean
        /* ? This isn't supposed to work according the the documentation.
         * Db.collection('foo') should return null.
         * http://mongodb.github.com/node-mongodb-native/api-generated/db.html#collection
        db._connection.collection('items').find().toArray(function(err, docs) {
            console.log('docs');
            console.log(docs);
        });
        */

        /* So much code! :\
        db._connection.collection('items', function(err, col) {
            if (err) {
                console.log(err);
                res.end(JSON.stringify({ error: err }));
            } else {
                col.find().toArray(function(err, docs) {
                    res.end(JSON.stringify(docs));
                });
            }
        });
        */

        /* Let's just cheat some... (defined in app.js) */

        if (!req.body.cmd) {
            res_json(res, { error: 'No command given.' });
            return;
        }

        switch (req.body.cmd) {
            case 'create-list':
                var list = new List(req.body.name || 'Unnamed list');
                db.items.insert(list, function(err, result) {
                    //* It auto-adds _id to list, neat (yet confusing). Doesn't
                    //even seem to be async.
                    res_json(res, list);
                });
                break;

            case 'read-list':
                db.items.find({ name: req.body.name }).toArray(function(err, docs) {
                    res_json(res, docs);
                });
                break;

            case 'read-all':
                db.items.find().toArray(function(err, docs) {
                    res_json(res, docs);
                });
                break;

            default:
                res_json(res, { error: 'No such command.' });
                break;
        }
    };
};

var List = function(name, url) {
    this.name = name;
    this.items = items || ['an item', 'another item'];
}

var res_json = function(res, obj) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
}
