var User = require('./User')

function Users(db) {
    this.db = db
    return this }

Users.prototype = {
    add : function(data, session) {
        return new User(this, data, session) },

    auth : function(username, password, session) {
        console.warn('Users.auth(): not implemented') },

    clean : function() {
        console.warn('users.clean(): not implemented (remove users with inactive sessions)') },
    
    find : function(query, cb) {
        var q = { username: new RegExp(query, 'i') }
        var fields = { username: 1, _id: 1 }
        this.db.user.find(q, fields).toArray(function(err, docs) {
            cb(docs) }) },

    login : function(username, password, session, cb) {
        var users = this
        this.db.user.find( { username: username } ).toArray(function(err,
            docs) {
            if (docs.length == 1) {
                if (docs[0].password === password)
                    cb(users.add(docs[0], session))
                else
                    cb( {error: 'wrong password' } ) }
            else
                cb( { error: 'no such username' } ) }) },

    register : function(username, password, session, cb) {
        var users = this
        this.db.user.find( { username: username } ).toArray(function(err,
            docs) {
            if (docs.length > 0)
                cb( { error: 'username already registered' } )
            else { 
                var user = { username: username, password: password }
                users.db.user.insert(user, function(err, docs) {
                    if (err)
                        console.error('Users.register():', err)
                    else {
                        console.log('registered docs', docs)
                        cb(users.add(docs[0], session)) } }) } }) } }

module.exports = Users
