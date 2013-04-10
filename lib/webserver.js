/**
 * dependencies
 */
var _url = require('url'),
    _http = require('http'),
    _express = require('express'),
    _consolidate = require('consolidate'),
    _poweredBy = require('connect-powered-by'),
    Users = require('./Users');


/**
 * WebServer
 * <
 *  db
 *  config
 */
var WebServer = function(db, config) {
    this.db = db;
    var http = this.http = _http.createServer();
    this.express = _express();
    this.route = this.express;
    var users = new Users(db)

    this.express.engine('dust.html', _consolidate.dust);
    this.express.set('views', config.views);
    this.express.set('view engine', 'dust.html');
    this.express.use(_express.logger('dev'));
    this.express.use(_poweredBy(null));
    this.express.use(_express.bodyParser());
    this.express.use(_express.cookieParser());
    this.express.use(_express.cookieSession( { secret: 'hej' } ));
    this.express.use(function(req, res, next) { //* app.db
        req.app.db = db
        next() })
    this.express.use(function(req, res, next) { //* app.users, req.user
        req.app.users = users
        if (req.session && req.session.user_id) {
            var id = req.session.user_id
            if (req.app.users[id])
                req.user = req.app.users[id] }
        next() })
    //this.express.use(_express.methodOverride());
    this.express.use(this.express.router);
    this.express.use(_express.static(config.static));
    //* dev
    var express = this.express;
    this.express.configure('development', function() {
        express.use(_express.errorHandler());
    });

    this.http.on('error', this.on_error);
    this.http.on('request', this.express);

    return this;
};

WebServer.prototype = {
    /**
     * WebServer.listen
     * <
     *  URL : to serve on
     *  callback : on listening
     */
    listen : function(url, cb) {
        this.url = url
        this.url_parsed = _url.parse(this.url)
        var host = this.url_parsed.hostname || 'localhost'
        var port = this.url_parsed.port || '1337'
        this.express.set('url', this.url)
        this.express.set('url_parsed', this.url_parsed)
        this.express.set('host', host)
        this.express.set('port', port)
        this.http.listen(port, host, cb) },

    /**
     * on_error
     * <
     *  err
     */
    on_error : function(err) {
        console.error('WebServer.on_error(err)', err) } }


/**
 * exports
 */
module.exports = {
    WebServer: WebServer
};
