/**
 * Created by trusky on 9/16/15.
 */

var passport = require("passport")
var SamlStrategy = require('passport-saml').Strategy
var bodyParser = require('body-parser')
var logger = require('morgan');
var fs = require ("fs")
var path = require("path")
var express = require('express');
var app = express();
var integrifyAuth = require("./integrify-auth")
var url = require("url")
var cookieParser = require("cookie-parser")

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


var config = false;


try {
   config =  require("./config.js")
    if  (config.samlStrategy.cert) {
        config.samlStrategy.cert = fs.readFileSync(path.join(__dirname,config.samlStrategy.cert), 'utf-8')
    }
}
catch (e) {
    console.log(e)
}



if (config) {

    var samlStrat = new SamlStrategy(
        config.samlStrategy,
        function(profile, done) {
            findByEmail(profile, function(err, user) {
                if (err) {
                    return done(err);
                }
                console.log(user);
                return done(null, user);
            });
        });



    passport.use(samlStrat);

    function findByEmail(profile, callback){
        return callback(null, profile);
    }

    app.use(passport.initialize());


    app.get('/metadata', function (req, res) {
        var metaData = samlStrat.generateServiceProviderMetadata()

        res.type('text/xml')
        res.send(metaData);
    });



    app.post('/login/callback',
        passport.authenticate('saml', { session:false, failureRedirect: '/', failureFlash: true }),
        function(req, res) {

            integrifyAuth.loginSaml(req.user, config.integrify, function (err, tok) {
                if (err) {
                    return res.status(500).send(err);
                }
                var destinationUrl = req.cookies.integrifyUrl;

                if (destinationUrl) {

                    var redirectrUrlObj = url.parse(destinationUrl);
                    delete redirectrUrlObj.search;
                    if (!redirectrUrlObj.query) redirectrUrlObj.query = {};
                    redirectrUrlObj.query.token_type = "bearer";
                    redirectrUrlObj.query.token = tok.token;
                    var redirectUrl = url.format(redirectrUrlObj);
                    return res.redirect(redirectUrl);
                } else {
                    return res.status(500).send("Your login too too long to process");

                }

            });

        }
    );

    app.get("/", function(req,res){
        var exp = 600 * 1000;
        var integrifyUrl = req.query.r || req.query.redirect;
        res.cookie('integrifyUrl', integrifyUrl, {maxAge: exp});

        res.redirect("/login")

    })

    app.get('/login',
        passport.authenticate('saml', { session:false, failureRedirect: '/', failureFlash: true }),
        function(req, res) {
            res.redirect('/');
        }
    );




}

app.get('/status', function (req, res) {
    var msg = "SAMl Module Not Configured"
    if (config){
        msg = 'SAML Module Loaded';

    }
    res.send(msg);
});

var SamlAuth = function(){
    this.router = app;
}

module.exports = new SamlAuth();