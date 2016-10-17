var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tweetilytics1',function(){
	console.log('mongodb connected');
})

module.exports = mongoose;
