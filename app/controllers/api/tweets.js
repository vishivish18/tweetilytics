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

router.get('/daily_stats', function(req, res, next) {
    var daily_stats = [];
    Tweet.distinct('created_at', function(err, distinct) {
            async.eachSeries(distinct, function(date, callback) {
                Tweet.count({
                    created_at: date
                }, function(err, count) {
                    var obj = {
                        date: date,
                        count: count
                    }
                    daily_stats.push(obj);

                    callback(err)
                });
            }, function(err) {
                if (err) throw err;
                res.json(daily_stats)
            });
        })
        // use $filter('date') on the friend end for week transition
})

module.exports = router
