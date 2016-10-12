var express = require('express');
var router = express.Router();
var config = require('./config');
var Twit = require('twit');
var extend = require('extend');
var counter = 0;
var T = new Twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret,
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
})

function crawlTweets(tweets, cb, res) {
    console.log(counter++);    
    T.get('search/tweets', { q: '##testingTwitterApiCrawler since:2011-07-11', count: 1 }, function(err, data, response) {
        tweets = extend(tweets, data);
        cb(tweets, res);
    })
}

function crawlTweetsCallback(data, res) {
    if (data.search_metadata) {
        var tweets = data;
        var statuses = tweets.statuses;
        var since_id = tweets.since_id ? tweets.since_id : null;
        var max_id = tweets.max_id ? tweets.max_id : null;
        var load_more = tweets.search_metadata.next_results ? true : false;
        load_more ? crawlTweets(tweets, crawlTweetsCallback, res) : res.json(tweets);
    }else {
        console.log(data);
    }


}


router.get('/tweets', function(req, res) {
    var tweets = null;
    crawlTweets(tweets, crawlTweetsCallback, res);

})

module.exports = router;
