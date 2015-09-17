var request = require("request");
var integrifyToken = require("integrify-access-token");

var logger = (function(){
    this.info = console.log;
    this.error = console.error;
})();

try {
     logger = require('integrify-require')('integrify-logger');
} catch(e) {
    console.log(e);
}

var integrifyAuth = {

}

integrifyAuth.loginSaml = function loginSaml(user, instanceAuthConf, callback){


    var options = {key: instanceAuthConf.consumer_key,secret:instanceAuthConf.consumer_secret,"url":instanceAuthConf.integrify_base_url, username:instanceAuthConf.service_user}
    var keyMap = instanceAuthConf.fieldMap;
    integrifyToken.getTokenFromJWT(options, function(err,tokenObj){

        if (err) {
            logger.error(err, "att-sso");
            return callback('invalid key or user', err);
        }
        //create an object for oauth header
        tokenObj = JSON.parse(tokenObj);

        //check to see is user exists
        var userUrl = url.resolve(instanceAuthConf.integrify_base_url,"users?username=" + user[keyMap["UserName"]]);

        logger.info("Checking user in Integrify DB", "att-sso");
        request.get({url: userUrl, headers:{Authorization: "Bearer " + tokenObj.access_token}},function(err,resp,users) {
            if (err) return callback(err);
            users = JSON.parse(users);
            //console.log(users);
            var thisUser = {};
            if (users.Items.length > 0) {
                var existingUser = users.Items[0];
                thisUser.SID = existingUser.SID;
                logger.info("User found", existingUser, "att-sso");
            }

            var mapKeys = _.keys(keyMap);
            var tz = instanceAuthConf.authTypes.saml.defaultTimeZone;

            if (tz) {
                thisUser.TimeZone = tz;
            }
            logger.info("Mapping SAML Response values to user properties", "att-sso");
            _.each(mapKeys, function(key){
                thisUser[key] = user[keyMap[key]];
            });

            thisUser.IsActive = true;

            //update or insert the user
            var saveUserUrl = url.resolve(instanceAuthConf.integrify_base_url,"users" + (thisUser.SID ? "/" + thisUser.SID : ""));

            logger.info("Saving user to Integrify", "att-sso");
            request.post({url: saveUserUrl, json:thisUser, headers:{Authorization: "Bearer " + tokenObj.access_token}}, function(err, resp, save) {
                if (err) {
                    logger.error("Error saving user", err, "att-sso");
                    return callback(err);
                }

                //activate the user's original token by calling the impersonate api with request-token=true in the querystring.
                imepersonateURL = url.resolve(instanceAuthConf.integrify_base_url,"access/impersonate?key=" + instanceAuthConf.consumer_key + "&user=" + thisUser.UserName);

                //the below code could be used to automatically expire the token in a certain timeframe
                //options = {key: instanceAuthConf.consumer_key,secret:instanceAuthConf.consumer_secret,"url":instanceAuthConf.integrify_base_url, username:thisUser.UserName, expiresInMinutes:20}
                //integrifyToken.getTokenFromJWT(options, function(err,tokenObj){

                request(imepersonateURL,function(err,resp,tokenObj){
                    if (!err) {

                        tokenObj = JSON.parse(tokenObj);
                        logger.info("recieved a valid access token", tokenObj, "att-sso")
                    }
                    callback(err,tokenObj);
                });

            })

        })

    });
}