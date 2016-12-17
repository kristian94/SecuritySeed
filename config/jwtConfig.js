/**
 * Created by Kristian Nielsen on 15-12-2016.
 */
module.exports.jwtConfig = {
    secret: "OkayImGonnaChangeYouNowNotSureWhatToPutHereThough",
    tokenExpirationTime : 60*20, //seconds
    audience: "yoursite.net",
    issuer: "yourcompany@somewhere.com"
}