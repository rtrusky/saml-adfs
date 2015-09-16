/**
 * Created by trusky on 9/16/15.
 */
var express = require("express")
var passport = require("passport")
var R = require ("ramda")
var SamlStrategy = require('passport-saml').Strategy
var bodyParser = require('body-parser')
var logger = require('morgan');
var fs = require ("fs")
var path = require("path")

var express = require('express');
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var samlConfig = {
    path: '/login/callback',
    entryPoint: 'https://integrifyadfs.integrify.com/adfs/ls',
    issuer: "integrify-saml-client",
    protocol: "https://",
    cert: fs.readFileSync(path.join(__dirname,"integrifyadfs.crt"), 'utf-8'),
    acceptedClockSkewMs: -1,
    authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/windows',
    identifierFormat: null

}


var samlStrat = new SamlStrategy(
    samlConfig,
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
    console.log(metaData)
    res.type('text/xml')
    res.send(metaData);
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/login/callback',
    passport.authenticate('saml', { session:false, failureRedirect: '/', failureFlash: true }),
    function(req, res) {
        res.redirect('/');
    }
);

app.get('/login',
    passport.authenticate('saml', { session:false, failureRedirect: '/', failureFlash: true }),
    function(req, res) {
        res.redirect('/');
    }
);
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

