var mongoose = require('mongoose')

var schema = require('../schemas/user')

var User = mongoose.model('zUser', schema)

module.exports = User
