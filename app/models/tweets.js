var db = require('./db')
var tweet = db.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    created_at: {
        type: String

    },
    text: {
        type: String
    },
    country: {
        type: String
    }
})

module.exports = db.model('Tweet', tweet)
