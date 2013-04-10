var mongoose = require('mongoose')


module.exports = {
    connect: function(db_url, cb) {
        mongoose.connect(db_url)
        this.connection = mongoose.connection
        //this.connection.on('error', this.on_error)
        this.connection.on('error', console.error.bind(console, 'connection error:'))
        var mongo = this
        this.connection.once('open', function() { cb(mongoose.connection) } )
    },

    models: {
        User: require('./models/User') },

    schemas: {
        user: require('./schemas/user') } }
