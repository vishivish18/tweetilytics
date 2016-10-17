var router = require('express').Router();
var Tweet = require('../../models/tweets');
var _ = require('underscore');


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

    function getDistinctQuery() {
        var promise = Tweet.distinct('created_at');
        return promise;
    }

    function getCountQuery(date) {
        var promise = Tweet.count({ created_at: date }).exec();
        return promise;
    }

    var promise = getDistinctQuery();
    promise.then(function(test) {
            test.forEach(function(date) {
                var anotherPromise = getCountQuery(date);
                anotherPromise.then(function(result) {
                    daily_stats[date] = result;
                    console.log(result);
                })
            })
        })
    console.log(daily_stats);
        // promise.exec(function(err, distinct) {
        //     if (err)
        //         return console.log(err);
        //     console.log(distinct);
        //     distinct.forEach(function(date) {
        //         Tweet.count({
        //             created_at: date
        //         }, function(err, count) {
        //             daily_stats[date] = count;
        //             console.log(count);

    //         })
    //     });

    // });
    // Tweet.distinct('created_at', function(err, distinct, res) {
    //     console.log(typeof(distinct));
    //     var daily_stats = [];
    //     distinct.map(function(date) {
    //         console.log(date);
    //         Tweet.count({
    //             created_at: date
    //         }, function(err, count) {
    //             daily_stats[date] = count;
    //             console.log(count);

    //         })
    //     })
    // })

    // use $filter('date') on the friend end for week transition
})







module.exports = router
