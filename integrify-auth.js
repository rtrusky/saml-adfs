var request = require("request");
var integrifyToken = require("integrify-access-token");
var url = require("url")
var R = require("ramda")

var logger;
try {
     logger = require('integrify-require')('integrify-logger');
} catch(e) {
    console.log(e);
    var logger = console;
}

var integrifyAuth = {}



integrifyAuth.loginSaml = function loginSaml(user, instanceAuthConf, callback) {


    var options = {
        key: instanceAuthConf.consumer_key,
        secret: instanceAuthConf.consumer_secret,
        "url": instanceAuthConf.integrify_base_url,
        username: instanceAuthConf.service_user
    }
    var keyMap = instanceAuthConf.fieldMap;
    integrifyToken.getTokenFromJWT(options, function (err, tokenObj) {

        if (err) {
            logger.error(err, "integrify-saml");
            return callback('invalid key or user', err);
        }
        //create an object for oauth header
        tokenObj = JSON.parse(tokenObj);

        //check to see is user exists
        var userUrl = url.resolve(instanceAuthConf.integrify_base_url, "users?username=" + user[keyMap["UserName"]]);

        logger.info("Checking user in Integrify DB", "integrify-saml");
        request.get({
            url: userUrl,
            headers: {Authorization: "Bearer " + tokenObj.access_token}
        }, function (err, resp, users) {
            if (err) return callback(err);
            users = JSON.parse(users);
            //console.log(users);
            var thisUser = {};
            if (users.Items.length > 0) {
                var existingUser = users.Items[0];
                thisUser.SID = existingUser.SID;
                logger.info("User found", existingUser, "integrify-saml");
            }

            var mapKeys = R.keys(keyMap);
            var tz = instanceAuthConf.defaultTimeZone;

            if (tz) {
                thisUser.TimeZone = tz;
            }
            logger.info("Mapping SAML Response values to user properties", "integrify-saml");
            var mapIt = function(x) { thisUser[x] = user[keyMap[x]]; };
            R.forEach(mapIt, mapKeys); //=> [1, 2, 3]
            //_.each(mapKeys, function (key) {
            //    thisUser[key] = user[keyMap[key]];
            //});

            thisUser.IsActive = true;

            //update or insert the user
            var saveUserUrl = url.resolve(instanceAuthConf.integrify_base_url, "users" + (thisUser.SID ? "/" + thisUser.SID : ""));

            logger.info("Saving user to Integrify", "integrify-saml");
            request.post({
                url: saveUserUrl,
                json: thisUser,
                headers: {Authorization: "Bearer " + tokenObj.access_token}
            }, function (err, resp, save) {
                if (err) {
                    logger.error("Error saving user", err, "integrify-saml");
                    return callback(err);
                }

                //activate the user's original token by calling the impersonate api with request-token=true in the querystring.
                imepersonateURL = url.resolve(instanceAuthConf.integrify_base_url, "access/impersonate?key=" + instanceAuthConf.consumer_key + "&user=" + thisUser.UserName);

                //the below code could be used to automatically expire the token in a certain timeframe
                //options = {key: instanceAuthConf.consumer_key,secret:instanceAuthConf.consumer_secret,"url":instanceAuthConf.integrify_base_url, username:thisUser.UserName, expiresInMinutes:20}
                //integrifyToken.getTokenFromJWT(options, function(err,tokenObj){

                request(imepersonateURL, function (err, resp, tokenObj) {
                    if (!err) {

                        tokenObj = JSON.parse(tokenObj);
                        logger.info("recieved a valid access token", tokenObj, "integrify-saml")
                    }
                    callback(err, tokenObj);
                });

            })

        })

    });
}

module.exports = integrifyAuth;