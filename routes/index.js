module.exports.html5 = function(db) {
  return function(req, res) {
    db.show.find().toArray(function(err, shows) {
      res.render('index', { user: req.user, shows: shows }) }) } }
