var Schema = require('mongoose').Schema

var user = new Schema( { 
  username: String,
  password: String,
  created: { type: Date, default: Date.now },
  shows: [] } )

user.statics.auth = function(username, password, cb) {
  console.log('user.auth() this', this)
  cb('w00t') }

module.exports = user
