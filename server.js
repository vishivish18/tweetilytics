'use-strict';

var express = require('express');
var app = express();
app.use('/', require('./app/controllers/static'));

var port = process.env.PORT || 1805;
var config = require('./config')
var Twit = require('twit')



//
//  tweet 'hello world!'
//
// T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
//   console.log(data)
// })
app.get('/tweets', function(req, res) {
	var tweets = null;
    var T = new Twit({
        consumer_key: config.consumer_key,
        consumer_secret: config.consumer_secret,
        access_token: config.access_token,
        access_token_secret: config.access_token_secret,
        timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    })
    T.get('search/tweets', { q: '#testingTwitterApiCrawler since:2011-07-11', count: 1 }, function(err, data, response) {
        tweets = data
        res.json(tweets);
    })

    
})



app.listen(port, function() {
    console.log('Magic begins at port ', port);
});
