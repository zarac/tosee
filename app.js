/**
 * To See
 *  Helps you with what to watch.
 *
 * Author
 *  Hannes Landstedt a.k.a. zarac
 *
 * Home / Source
 *  https://github.com/zarac/tosee
 */


//* Environment
var WWW_PORT = process.env.WWW_PORT || 3000;
var WWW_HOST = process.env.WWW_HOST || '0.0.0.0';


//* Load modules
var express = require('express'),
    http = require('http'),
    path = require('path'),
    consolidate = require('consolidate'),
    mongodb = require('mongodb'),
    routes = require('./routes/main'),
    api = require('./routes/api'),
    find = require('./routes/find'),
    show = require('./routes/show'),
    res_json = require('./lib/common').res_json;


//* Initialize database
var db = process.db = new Object();
mongodb.MongoClient.connect('mongodb://localhost/z-to-see',
        function(err, con) {
    if (err) throw err;
    console.log('Connected to mongoDB.');
    db._connection = con;
    db.show = con.collection('show');
});


//* Initialize web server
var app = express();

app.engine('dust.html', consolidate.dust);

app.configure(function() {
    app.set('port', WWW_PORT);
    app.set('host', WWW_HOST);
    app.set('views', __dirname + '/static/views');
    app.set('view engine', 'dust.html');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'static')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});


//* Initialize web server routes
app.get('/', routes.index(db));
app.get('/find/:query', find());
//* API routes
//* TODO RESTfulize
app.get('/show/:id', show.main(db));
app.get('/show/:id/add', show.add(db));
app.get('/show/:id/remove', show.remove(db));
app.get('/show/:id/update', show.update(db));
app.post('/api', api(db));
//* Test stuff
app.get('/addtestshows', function(req, res) {
    var shows = [
        { name: 'Person of Interest', source: { id: '28376' } },
        { name: 'Big Bang Theory, The', source: { id: '8511' } }
    ];
    db.show.insert(shows, function() {
        res_json(res, { status: 0 });
    });
});


//* Let's listen
http.createServer(app).listen(app.get('port'), app.get('host'), function() {
    console.log("Web server listening on port " + app.get('port'));
});
