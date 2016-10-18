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

router.get('/frequency_stats', function(req, res, next) {
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
                res.json(daily_stats.reverse())
            });
        })
        // use $filter('date') on the font end for week transition
})
router.get('/location_stats', function(req, res, next) {
    var location_stats = [];
    Tweet.distinct('country', function(err, distinct) {
        async.eachSeries(distinct, function(country, callback) {
            Tweet.count({
                country: country
            }, function(err, count) {
                var obj = {
                    country: country,
                    count: count
                }
                location_stats.push(obj);

                callback(err)
            });
        }, function(err) {
            if (err) throw err;
            res.json(location_stats)
        });
    })
})

router.get('/search/:term', function(req, res, next) {
    var text = req.params.term;
    Tweet.find({ $text: { $search: text } }, function(err, tweets) {
        if (err) {
            console.log(err);
        }
        res.json(tweets)
    });

})




module.exports = router
