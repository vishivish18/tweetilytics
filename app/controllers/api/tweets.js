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

    console.log(req.headers.page)
    var current_page = req.headers.page ? parseInt(req.headers.page) : 1;
    var total = 69000; // TODO : aysnc $text find() and count query
    var per_page = 10;
    var last_page = total / per_page;

    var skip = (current_page - 1) * per_page;
    console.log(typeof(current_page));
    var metadata = {
        current_page: current_page,
        total: total,
        last_page: last_page,
        per_page: per_page
    }

    var text = req.params.term;
    Tweet.find({ $text: { $search: text } })
        .limit(per_page)
        .skip(skip)
        .exec(function(err, tweets) {
            if (err) {
                console.log(err);
            }
            var obj = {
                metadata: metadata,
                tweets: tweets
            }
            res.send(obj);
        });
})




module.exports = router
