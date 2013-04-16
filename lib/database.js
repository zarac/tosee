/**
 * dependencies
 */
var _mongodb = require('mongodb');


/**
 * class
 */
var Database = function(config) {
    this.config = config;
    this.con = null;
    return this;
};

Database.prototype.bindModel = function(key) {
    this[key] = this.con.collection(key);
    var old_insert = this[key].insert;
    this[key].insert = this.insert(this[key], old_insert)
};

Database.prototype.bindModels = function() {
    for (var key in this.config.models)
        this.bindModel(key);
};

Database.prototype.insert = function(self, old_insert) {
    return function insert(a, b, c) {
        console.log('insert extention');
        old_insert.call(self, a, b, c);
    };
};

Database.prototype.on_connect = function(cb) {
    var db = this;
    return function(err, con) {
        db.con = con;
        db.bindModels();
        cb(con);
    };
};

Database.prototype.connect = function(url, cb) {
    this.url = url;
    _mongodb.MongoClient.connect(url, this.on_connect(cb));
};


/**
 * publics
 */
module.exports = {
    Database: Database
};
