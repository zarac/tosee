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
    routes = require('./routes/main'),
    api = require('./routes/api'),
    find = require('./routes/find'),
    consolidate = require('consolidate'),
    mongodb = require('mongodb');


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
app.get('/find/:name', find());
app.post('/api', api(db));


//* Let's listen
http.createServer(app).listen(app.get('port'), app.get('host'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
