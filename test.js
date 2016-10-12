var config = require('./config')
var Twit = require('twit')

var T = new Twit({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret,
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
})

//
//  tweet 'hello world!'
//
// T.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
//   console.log(data)
// })

T.get('search/tweets', { q: '#analytics since:2011-07-11', count: 100 }, function(err, data, response) {
    res.json(data)
})
