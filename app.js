/**
 * To See
 *  Helps you with what to watch next.
 *
 * Author
 *  Hannes Landstedt a.k.a. zarac
 *
 * Home / Source
 *  https://github.com/zarac/tosee
 */


/**
 * debug help
 */
console.eyes = require('eyes').inspector({ maxLength: 0 });
console.Zerror = function(err) {
    err.stack = err.stack.split('\n');
    console.eyes(err);
};
console.Zkeys = function(obj) {
    var keys = { };
    for (var key in obj)
        if (obj.hasOwnProperty(key))
            keys[key] = key;
    console.eyes(keys);
};


/**
 * config
 */
var db_url = process.env.CC_DB_URL || 'mongodb://localhost/z-to-see',
    www_url = process.env.CC_WWW_URL || 'http://0.0.0.0:3000';


/**
 * database
 * <
 *  db_config
 */
var _db = require('./lib/database');
var db_config = {
    url: db_url,
    models: {
        log: { },
        seen: { },
        show: {
            id: /[a-z0-9]/,
            name: 'Unnamed Show'
        },
        user: {
            id: 0,
            name: 'J. Random Watcher'
        }
    }
};
var db = new _db.Database(db_config);


/**
 * web server
 * <
 *  db
 *  www_config
 */
var _www = require('./lib/webserver'),
    _path = require('path');
var config = {
    url: www_url,
    views: _path.join(__dirname, '/static/views'),
    static: _path.join(__dirname, '/static')
};
var www = new _www.WebServer(db, config),
    index = require('./routes/index'),
    find = require('./routes/find'),
    show = require('./routes/show');
//* HTML5 routes
www.route.get('/', index.html5(db));
//* API routes
www.route.get('/find', find());
//www.route.post('/find/:query', find());
www.route.get('/show/:id', show.main(db));
www.route.get('/show/:id/add', show.add(db));
www.route.get('/show/:id/remove', show.remove(db));
www.route.get('/show/:id/update', show.update(db));
www.route.get('/show/:sid/episode/:eid/toggleseen', show.toggle_seen(db));


/**
 * run
 */
db.connect(db_url, function onConnected(con) {
    console.log('connectd to database [ ' + db_url + ' ]');
    www.listen(www_url, function onListening(o) {
        console.log('web server listening [ ' + www_url + ' ]');
        db.log.insert({ status: 'all ok', db: db_url, www: www_url },
            function(err, doc) {
                console.log('err');
                console.eyes(err);
                console.log('doc');
                console.eyes(doc);
            });
    });
});
