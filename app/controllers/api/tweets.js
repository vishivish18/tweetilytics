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
            // I get an object with all the distinct dates available
            // like : [`Mon Oct 17 2016 00:00:00 GMT+0530 (IST)`,`SUN Oct 16 2016 00:00:00 GMT+0530 (IST)`]
            // I can save the day and count as key value in daily_stats
            // [`Mon Oct 17 2016 00:00:00 GMT+0530 (IST) : 10`,
            //   `SUN Oct 16 2016 00:00:00 GMT+0530 (IST)`: 13 ]
            distinct.map(function(date) {
                Tweet.count({
                    created_at: date
                }, function(err, count) {
                    daily_stats[date] = count;
                })
            })

        })
        // use $filter('date') on the friend end for week transition
})







module.exports = router
