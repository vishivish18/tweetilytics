var mongoose = require('mongoose');
var config = require('../../config');
mongoose.connect(config.mongoURL, function() {
    console.log('mongodb connected');
})
mongoose.connection.on('open', function(ref) {
    console.log('Connected to Mongo server...');
});

module.exports = mongoose;
