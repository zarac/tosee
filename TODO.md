TODO
====
WebServer
  app.users
    Users {
      add(User)
      auth( { username, password }, req.session) : User
      find( { username } )
      register( { username, password } || User ) : User
      confirm(User, password) : User
      remove(User)
      update(User)
      User(user, session) {
        data
        exit()
        id
        session
        update() }
      users [User] }
  req.user = app.users[session.user_id]

  req User users
   o---->
      

 " vim: set tw=78 ts=2 sw=2 fdm=indent: "
