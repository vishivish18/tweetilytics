var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tweetilytics',function(){
	console.log('mongodb connected');
})

module.exports = mongoose;
