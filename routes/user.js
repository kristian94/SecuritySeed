/**
 * Created by Kristian Nielsen on 17-12-2016.
 */
var router = require('express').Router();
var passport = require('passport')
var jwtConfig = require("../config/jwtConfig").jwtConfig;
var User = require('../app/models/user'); // get the mongoose model
var jwt = require('jwt-simple')
var bodyParser  = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get("/names",function(req, res){
    res.json([{name: "Peter"}, {name: "Kurt"},{name: "Hanne"}]);
    User.find(function(err, users){
        console.log(users)
    })
})

router.get("/hellos", passport.authenticate('jwt', { session: false}),function(req, res){
    res.json([{msg: "Hello World" }, {msg: "Hello all"},{msg: "Hello guys"}]);
})

// create a new user account (POST http://localhost:8080/api/signup)
router.post('/signup', function(req, res) {
    console.log(req.body)
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    } else {
        var newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        // save the user
        newUser.save(function(err) {
            if (err) {
                console.error(err)
                return res.json({success: false, msg: 'username already exists.'});
            }
            res.json({success: true, msg: 'Successful created new user.'});
        });
    }
    User.find({}, function(err, users) {
        console.log(users)
    })
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
router.post('/authenticate', function(req, res) {
    User.findOne({
        username: req.body.username
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.status(401).send({ msg: 'Authentication failed. User not found.'});
        } else {
            user.comparePassword(req.body.password, function (err, isMatch) {
                if(err){
                    res.status(500).send({ msg: 'Something went wrong with the server'});
                    return
                }
                if (isMatch) {
                    // if user is found and password is right create a token
                    var iat = new Date().getTime()/1000; //convert to seconds
                    var exp = iat+jwtConfig.tokenExpirationTime;
                    var payload = {
                        aud: jwtConfig.audience,
                        iss: jwtConfig.issuer,
                        iat: iat,
                        exp: exp,
                        sub: user.username
                    }
                    var token = jwt.encode(payload, jwtConfig.secret);
                    // return the information including token as JSON
                    res.json({token: 'JWT ' + token});
                } else {
                    res.status(401).send({ msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
});


// route to a restricted info (GET http://localhost:8080/api/memberinfo)
router.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, jwtConfig.secret);
        console.log('logging decoded')
        console.log(decoded)
        User.findOne({
            username: decoded.sub
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                res.json({success: true, msg: 'Welcome in the member area ' + user.username + '!'});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }

});

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = function(){
    return router
}