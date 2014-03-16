var tester = require('../lib/tester.js')

var User = require('../lib/User')

console.log(tester.test('User : Add', function() {
  var users = []
  var data = { _id : '1' }
  var session = { }
  var user = new User(users, data, session)
  console.log('user = ', user)
  return tester.ok } ) )
