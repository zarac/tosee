var handle_user = function(db, req, res) {
  var username = req.body.username,
    password = req.body.password
  if (username && password) { //* log in / register
    var q = { username: username }
    db.user.find(q).toArray(function(err, docs) {
      console.log(' ::: /user/ docs', docs)
      if (docs.length > 0) { //* found user
        var user = docs[0]
        req.session.user_id = user._id
        if (user.password === password) { //* log in
          req.app.users.add(user, req.session)
          req.user = req.app.users[user._id]
          res.json( { user: req.user.data } ) }
        else {
          var r = { error: 'username and password mismatch' }
          res.json(r) } }
      else { //* register
        var user = { username: username, password: password }
        db.user.insert(user, function(err, doc) {
          console.log(' ::: /user/ register > doc', doc)
          var r = { user: { user: { _register: true, username: doc[0].username,
            id: doc[0]._id } } }
          res.json(r) }) } }) }
  else if (username) { //* searching
    var q = { username: username }
    db.user.find(q).toArray(function(err, docs) {
      console.log(' ::: /user/ docs', docs)
      var r = { user: { query: username, result: { users: docs } } }
      res.json(r) }) }
  else res.json( { error: 'missing parameters' } ) }

var handle_show_add = function(db, req, res) {
  req.user.shows.push( { id: req.params.id } )
  req.user.save()
  res.json( { status: 0 }) }

module.exports = {
  confirm : function(req, res) {
    res.json( { error: '/user/confirm not implemented' } ) },

  exit : function(req, res) {
    req.user.exit()
    req.session = null
    res.json( { user: { _exit: true } } ) },

  find : function(req, res) {
    var users = req.app.users.find(req.body.username, function(users) {
      var r = { user: {
        query: req.body.username,
        users: users } }
      res.json(r) }) },

  login : function(req, res) {
    var username = req.body.username
    var password = req.body.password
    var session = req.session
    req.app.users.login(username, password, session, function(user) {
      if (user.error)
        res.json(user)
      else {
        var r = { user: {
          id: user.id,
          username: user.username } }
        res.json(r) } }) },

  register : function(req, res) {
    var username = req.body.username
    var password = req.body.password
    req.app.users.register(username, password, req.session,
      function(user) {
      if (user.error)
        res.json(user)
      else {
        console.log('registered user:', user)
        var r = { user: {
          id: user.id,
          username: user.username } }
        res.json(r) } }) },

  smart : function(req, res) {
    if (req.body.username) {
      if (req.body.password) {
        var q = { username: req.body.username }
        req.app.db.user.find(q).toArray(function(err, docs) {
          if (docs.length > 0)
            module.exports.login(req, res)
          else
            module.exports.register(req, res) }) }
      else
        module.exports.find(req, res) }
    else
      res.json( { error: 'missing parameters' } ) },

  show : { 
    add : function(db) {
      return function(req, res) {
        handle_show_add(db, req, res) } } } }
