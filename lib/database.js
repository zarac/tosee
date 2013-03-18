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
    console.log('old_insert');
    console.eyes(old_insert);
    this[key].insert2 = this.insert(old_insert)
};

Database.prototype.bindModels = function() {
    for (var key in this.config.models)
        this.bindModel(key);
};

Database.prototype.insert = function(old_insert) {
    return function insert(a, b) {
        console.eyes(arguments);
        console.log('insert extention');
        old_insert(a, b);
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
