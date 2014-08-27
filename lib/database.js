/**
 * dependencies
 */
var _mongodb = require('mongodb');


/**
 * class
 */
var Database = function(config) {
  this.config = config
  this.con = null
  return this }

Database.prototype.bindModel = function(key) {
  this[key] = this.con.collection(key)
  var old_insert = this[key].insert
  this[key].insert = this.insert(this[key], old_insert) }

Database.prototype.bindModels = function() {
  // TODO unbind old? (not sure when there'd be any).
  for (var key in this.config.models)
    this.bindModel(key) }

Database.prototype.insert = function(self, old_insert) {
  return function insert(a, b, c) {
    console.log('insert extention')
    old_insert.call(self, a, b, c) } }

Database.prototype.onConnect = function(cb) {
  var db = this
  return function(err, con) {
    db.con = con
    if (!err) db.bindModels()
    cb(err, con) } }

Database.prototype.connect = function(url, cb) {
  this.url = url
  _mongodb.MongoClient.connect(url, this.onConnect(cb)) }


/**
 * publics
 */
module.exports = {
  Database: Database }
