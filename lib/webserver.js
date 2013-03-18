console.log('this:');
console.log(__dirname);
/**
 * dependencies
 */
var _url = require('url'),
    _http = require('http'),
    _express = require('express'),
    _consolidate = require('consolidate');


/**
 * WebServer
 * <
 *  db
 */
var WebServer = function(db, config) {
    this.db = db;
    var http = this.http = _http.createServer();
    this.express = _express();
    this.route = this.express;

    this.express.engine('dust.html', _consolidate.dust);
    var express = this.express;
    express.set('views', config.views);
    express.set('view engine', 'dust.html');
    express.use(_express.favicon());
    express.use(_express.logger('dev'));
    express.use(_express.bodyParser());
    express.use(_express.methodOverride());
    express.use(express.router);
    express.use(_express.static(config.static));
    //* dev
    this.express.configure('development', function() {
        express.use(_express.errorHandler());
    });

    this.http.on('error', this.on_error);
    this.http.on('request', this.express);

    return this;
};

WebServer.prototype.on_error = function(err) {
    console.log('WebServer.on_error(%s)', err);
    console.eyes(err);
};

/**
 * WebServer.listen
 * <
 *  URL : to serve on
 *  callback : on listening
 */
WebServer.prototype.listen = function(url, cb) {
    this.url = url;
    this.url_parsed = _url.parse(this.url);
    var host = this.url_parsed.hostname || 'localhost';
    var port = this.url_parsed.port || '1337';
    this.express.set('url', this.url);
    this.express.set('url_parsed', this.url_parsed);
    this.express.set('host', host);
    this.express.set('port', port);
    this.http.listen(port, host, cb);
};


module.exports = {
    WebServer: WebServer
};
