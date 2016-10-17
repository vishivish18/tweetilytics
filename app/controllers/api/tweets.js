var router = require('express').Router();
var Tweet = require('../../models/tweets');
var _ = require('underscore');
var async = require("async");


router.get('/', function(req, res, next) {
    Tweet.find()
        .limit(10)
        .exec(function(err, tweets) {
            if (err) {
                console.error(err);
            }
            var tweets = _.filter(tweets, function(tweet) {
                return tweet.country !== "N/A";
            });
            tweets.map(function(tweet) {
                var date = new Date(tweet.created_at);
                console.log(date.getDate());
            })
            res.json(tweets);
        });
})

router.get('/stats', function(req, res, next) {
    var daily_stats = [];
    Tweet.distinct('created_at', function(err, distinct) {
        getCountQuery(distinct, callback)
    })

    function callback(res) {
        console.log(daily_stats)
    }

    function getCountQuery(distinct, callback) {
        async.forEach(distinct, function(date, callback) {
            console.log(date); // print the key
            Tweet.count({
                created_at: date
            }, function(err, count) {
                setCount(date, count);
            })
            callback(daily_stats); // tell async that the iterator has completed

        }, function(err) {
            console.log('iterating done');
        });
    }

    function setCount(date, count) {
        daily_stats[date] = count;
    }






    // use $filter('date') on the friend end for week transition
})







module.exports = router
