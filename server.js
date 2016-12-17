/**
 * Created by Kristian Nielsen on 15-12-2016.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require("passport");
var passportConfig = require("./config/passport");
passportConfig(passport);
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config/database'); // get db config file
var port = process.env.PORT || 8080;
var jwt = require('jwt-simple');
var jwtConfig = require("./config/jwtConfig").jwtConfig;

// get our request parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// Lars måde
// app.use('/api', function (req, res, next) {
//     if (req.url == '/authenticate' || req.url == '/signup') {
//         next()
//     } else {
//
//         passport.authenticate('jwt', {session: false}, function (err, user, info) {
//
//             if (err || !user) {
//                 if(err){
//                     console.error(err)
//                 }else{
//                     console.error(info)
//                 }
//                 return res.status(403).json({mesage: "Token could not be authenticated", fullError: info})
//             }else{
//                 next();
//             }
//             // return res.status(403).json({mesage: "Token could not be authenticated", fullError: info});
//         })(req, res, next);
//     }
// });

// Alternativ løsning
// app.use('/api', function(req, res, next) {
//     passport.authenticate('jwt', {session: false}, function(err, user, info) {
//         if (err) { res.status(403).json({mesage:"Token could not be authenticated",fullError: err}) }
//         if (user) { return next(); }
//         return res.status(403).json({mesage: "Token could not be authenticated", fullError: info});
//     })(req, res, next);
// });



// demo Route (GET http://localhost:8080)
app.get('/', function (req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// connect to database
mongoose.connect(config.database);

// pass passport for configuration
require('./config/passport')(passport);

// bundle our routes
var router = require('./routes/user');

// connect the api routes under /api/*
app.use('/api', router());

// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);