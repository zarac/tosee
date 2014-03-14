var User = function(users, data, session) {
  this.users = users
  this.data = data
  this.session = session
  this.id = data._id
  this.username = data.username
  this.session.user_id = this.id
  this.users[this.id] = this
  return this }

User.prototype = {
  data : {
    shows: [] },

  exit : function() {
    delete(this.users[this.id])
    this.session = null }, //* need req.session = null

  save : function() {
    console.log(' :: User.save(): not implemented') } }

module.exports = User
