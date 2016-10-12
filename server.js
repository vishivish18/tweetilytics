"use-strict"

var express = require('express');
var router = express.Router();
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies
app.use('/', require('./app/controllers/static'))
app.use('/crawl', require('./crawler'));

var port = process.env.PORT || 1805
var server = app.listen(port, function() {
    console.log("Live on ", port)
})
