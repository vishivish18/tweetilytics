var express = require('express');
var router = express.Router();
var config = require('./config');
var Twit = require('twit');
var extend = require('extend');
var Tweet = require('./app/models/tweets');

fs = require('fs');
var moment = require('moment');



var counter = 0;
var T = new Twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret
        // timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
})

function crawlTweets(tweets, cb, res, since_id) {
    console.log(counter++);
    T.get('search/tweets', { q: '#analytics', count: 100, max_id: since_id ? since_id : null }, function(err, data, response) {
        tweets = extend(tweets, data);
        cb(tweets, res, since_id);
    })
}

function crawlTweetsCallback(data, res, prev_lowest) {

    if (!data.errors) {
        var tweets = data;
        var statuses = tweets.statuses;
        var since_id = tweets.search_metadata.since_id_str ? tweets.search_metadata.since_id_str : null;
        var max_id = tweets.search_metadata.max_id_str ? tweets.search_metadata.max_id_str : null;
        var lowest_id = tweets.statuses[tweets.statuses.length - 1].id
        statuses.map(function(status) {
            console.log(status.created_at);
            var d = new Date(status.created_at);
            d.setHours(0, 0, 0, 0, 0);
            var tweet = new Tweet({
                id: status.id,
                created_at: d,
                text: status.text,
                country: status.place ? status.place.country : 'N/A'

            })
            tweet.save(function(err, tweet) {
                if (err) {
                    //console.log(err)

                }
                //console.log("successfull")
                // res.send(201)                    

            })
        })
       
        if (prev_lowest == lowest_id) {
            load_more = false;
        } else {
            load_more = true;
        }
        load_more = true
        console.log("Loading more is: " + load_more)
        load_more ? crawlTweets(tweets, crawlTweetsCallback, res, lowest_id) : res.json(tweets);
        //res.json(tweets);
    } else {
        console.log("There is timeout for RATE LIMTI" + data.errors[0].code);
        console.log("I am Waiting");
        // setInterval(function() { 
        //     console.log("Tick");
        // }, 30 * 1000);
        setTimeout(function() {
            console.log("I am done waiting, let's try again !")
            crawlTweets(null, crawlTweetsCallback, res, prev_lowest)
        }, (16 * 60) * 1000);
    }




}


router.get('/tweets', function(req, res) {
    console.log("got the call")
    var tweets = null;
    crawlTweets(tweets, crawlTweetsCallback, res);

})

module.exports = router;
