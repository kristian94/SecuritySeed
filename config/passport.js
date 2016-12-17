var JwtStrategy = require("passport-jwt").Strategy;
ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require("jwt-simple");
var User = require("../app/models/user");
var config = require("../config/database");
var jwtConfig = require("./jwtConfig").jwtConfig;
module.exports = function(passport){
    var opts = {};
    opts.secretOrKey =jwtConfig.secret;
    opts.issuer =jwtConfig.issuer;
    opts.audience =jwtConfig.audience;
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    passport.use(new JwtStrategy(opts,function(jwt_payload,done){
        User.findOne({username: jwt_payload.sub},function(err,user){
            if(err){
                return done(err,false);
            }
            if(user){
                done(null,user); //You could choose to return the payLoad instead
            }
            else{
                done(null,false,"User found in token not found");
            }
        })
    }))
};