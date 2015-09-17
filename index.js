/**
 * Created by trusky on 9/16/15.
 */

var passport = require("passport")
var R = require ("ramda")
var SamlStrategy = require('passport-saml').Strategy
//var SamlStrategy = require('./lib/passport-saml/index').Strategy
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
    identifierFormat: null,
    signatureAlgorithm: 'sha256'

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

app.get('/mock', function(re,res){

    var form = '<form action="/login/callback" method="post"><textarea name="SAMLResponse" cols="100" rows="20">' +
        'PHNhbWxwOlJlc3BvbnNlIElEPSJfMzdlYzlkOTYtZWMzMi00NjhlLTgwNmItYTNlZGY1Y2FlNmJkIiBWZXJzaW9uPSIyLjAiIElzc3VlSW5zdGFudD0iMjAxNS0wOS0xNlQxODowOTo0Mi44NjhaIiBEZXN0aW5hdGlvbj0iaHR0cHM6Ly9hZGZzY2xpZW50LmludGVncmlmeS5jb20vbG9naW4vY2FsbGJhY2siIENvbnNlbnQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjb25zZW50OnVuc3BlY2lmaWVkIiBJblJlc3BvbnNlVG89Il84ZGI1MjM2NzIxZmU0NWJjMTgyNyIgeG1sbnM6c2FtbHA9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpwcm90b2NvbCI%2BPElzc3VlciB4bWxucz0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiI%2BaHR0cDovL0ludGVncmlmeUFERlMuaW50ZWdyaWZ5LmNvbS9hZGZzL3NlcnZpY2VzL3RydXN0PC9Jc3N1ZXI%2BPHNhbWxwOlN0YXR1cz48c2FtbHA6U3RhdHVzQ29kZSBWYWx1ZT0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOnN0YXR1czpTdWNjZXNzIiAvPjwvc2FtbHA6U3RhdHVzPjxBc3NlcnRpb24gSUQ9Il80YzJiOGY2Yi01ZDEyLTRkZWQtOWQ4NS0wZWU3NGI0ZGEwNWQiIElzc3VlSW5zdGFudD0iMjAxNS0wOS0xNlQxODowOTo0Mi44NjdaIiBWZXJzaW9uPSIyLjAiIHhtbG5zPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj48SXNzdWVyPmh0dHA6Ly9JbnRlZ3JpZnlBREZTLmludGVncmlmeS5jb20vYWRmcy9zZXJ2aWNlcy90cnVzdDwvSXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPjxkczpTaWduZWRJbmZvPjxkczpDYW5vbmljYWxpemF0aW9uTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIiAvPjxkczpTaWduYXR1cmVNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNyc2Etc2hhMjU2IiAvPjxkczpSZWZlcmVuY2UgVVJJPSIjXzRjMmI4ZjZiLTVkMTItNGRlZC05ZDg1LTBlZTc0YjRkYTA1ZCI%2BPGRzOlRyYW5zZm9ybXM%2BPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIiAvPjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiIC8%2BPC9kczpUcmFuc2Zvcm1zPjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiIC8%2BPGRzOkRpZ2VzdFZhbHVlPmhRNnVHOWtyS211dWVWQ1BCaGZwL0FOS1JLa2gxRS9ieTdEY0tPczJJUFU9PC9kczpEaWdlc3RWYWx1ZT48L2RzOlJlZmVyZW5jZT48L2RzOlNpZ25lZEluZm8%2BPGRzOlNpZ25hdHVyZVZhbHVlPkZoUW9VYnI0ejdUcEdOREQvRjJzTTZKZVNFNGk5RTQ0QUNqS2VhdGJXd1dSc2FVWS8rZGZiellIVFluRENrSlZEbmM1T3JjcS9NWkZ5ZmdJdW1OWmw1RVNnOW1BREVwcHBFTFJWTHNKOHNFOTNSK1A4ellCa1IwTmE4TXk5MlNHem1RYm85N2hYN2NaQVBQUUQwUjFhaTJSbjVEeFVnMTNzQjJHVGhPRS9OUUU5anRucG16SjBNc3ltMHRYbExYMTBkRHRIcUR2b0hXeVRNSmpRYktPZUJSWXFXbVJsaHBMMHk5ajdpUTlCYXFzNlMzM1lwS3hmQmhOM09FeWszNnZWa0ovQXIvU1JVODQwUlhtZkhFeXE3Ryt5Z2d2NDFmdzdvaTlvRUFQTDczMUNXTUJUUG16OEphRm9qdDJHdlNyMkxvejQyNTdLNXVvbmwreGk3bkNpQT09PC9kczpTaWduYXR1cmVWYWx1ZT48S2V5SW5mbyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnIyI%2BPGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU%2BTUlJQzhqQ0NBZHFnQXdJQkFnSVFiSFVMbHRvNXZJaEZ5S1ZnanBKdlpqQU5CZ2txaGtpRzl3MEJBUXNGQURBMU1UTXdNUVlEVlFRREV5cEJSRVpUSUZOcFoyNXBibWNnTFNCSmJuUmxaM0pwWm5sQlJFWlRMbWx1ZEdWbmNtbG1lUzVqYjIwd0hoY05NVFV3T1RFMk1UVXlNelE0V2hjTk1UWXdPVEUxTVRVeU16UTRXakExTVRNd01RWURWUVFERXlwQlJFWlRJRk5wWjI1cGJtY2dMU0JKYm5SbFozSnBabmxCUkVaVExtbHVkR1ZuY21sbWVTNWpiMjB3Z2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRREQ1N0V0UFE3cU5ZdHBHc1VFZ2p4RUpGUlErYm54UTlhU0FOaWlUSVZvYmgxWjYxWkJ6d0xvUVZLQVhiRDNHR1pJcnhFeHRJdG1GQ1pYWVpvMm5iT1dyWkN3Nmk5RDZHM01oeGJZTVlYY0IrWDZVNHR6bzBnRjdqaWw0cmR4Q2xFU1ZvQ25UMC96cVJPTXo5ZEdGNGdwOGVYcjJFT0tndlVNUFlWWk9pamc2alNWTGdONXoxdjgrN0M1NGlycXYvaW1RL2prQ3c4LzNEdE9CZElOUStBU0JTNW1JblpzMjZ4N3ZoWkhLajV0c0hQeC91Skt6cnQvcGdlTG9HMFlGM3MydUdBV2pGVG90eThDajIvRFdqUXhIQTdrY1dSbVJZc3g4NUY1eDQzKzFRaU44YmhFb1RYVkQwazRYaXZwS0U0dFBTRUpxNWNBaitKRXhnQkdpZE9uQWdNQkFBRXdEUVlKS29aSWh2Y05BUUVMQlFBRGdnRUJBR00rSU0zMzMvOHJNZzlYQnhIbEVtWW1oYk9rZnhzdVY3UWd3TXJkaTZQSzFHajFwelpWYlhBZ0ZmNmRvSGhid2lGbnhhUFdtdmRtNHRhWjZlK294Zk92TXI0bmg4ZS9sV0ZvUWt3anNCaFJPOUpPNElSMjVhYmdoeVVReDB0OTkxWWNzVHhSeUZKWEZLa2ZtUHdET3JydXVhWms3am5pRVdVeUVNdWx6MWdmVTFtMFVtNnFUVDR2UnQvcVZPYW1qS0FLNmQvM0NtMHNmNmc5VTF0OUhwdXFlTkpydjRjZ0JKdE85S1czUURnSElnNjRRN3lweUVnRGd4RStvYXk2Si9rdmc3cEtvME9yUEsyWXdvVlhLR3IwU0piUEtFS2xxUjFqUiszVGZCRXdtSUF2UUlqZUtFYWdrV01WV2F2VDJlWWNTUEN0VzFoVXlpcVkyQXoxMzJzPTwvZHM6WDUwOUNlcnRpZmljYXRlPjwvZHM6WDUwOURhdGE%2BPC9LZXlJbmZvPjwvZHM6U2lnbmF0dXJlPjxTdWJqZWN0PjxTdWJqZWN0Q29uZmlybWF0aW9uIE1ldGhvZD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmNtOmJlYXJlciI%2BPFN1YmplY3RDb25maXJtYXRpb25EYXRhIEluUmVzcG9uc2VUbz0iXzhkYjUyMzY3MjFmZTQ1YmMxODI3IiBOb3RPbk9yQWZ0ZXI9IjIwMTUtMDktMTZUMTg6MTQ6NDIuODY4WiIgUmVjaXBpZW50PSJodHRwczovL2FkZnNjbGllbnQuaW50ZWdyaWZ5LmNvbS9sb2dpbi9jYWxsYmFjayIgLz48L1N1YmplY3RDb25maXJtYXRpb24%2BPC9TdWJqZWN0PjxDb25kaXRpb25zIE5vdEJlZm9yZT0iMjAxNS0wOS0xNlQxODowOTo0Mi44NjZaIiBOb3RPbk9yQWZ0ZXI9IjIwMTUtMDktMTZUMTk6MDk6NDIuODY2WiI%2BPEF1ZGllbmNlUmVzdHJpY3Rpb24%2BPEF1ZGllbmNlPmludGVncmlmeS1zYW1sLWNsaWVudDwvQXVkaWVuY2U%2BPC9BdWRpZW5jZVJlc3RyaWN0aW9uPjwvQ29uZGl0aW9ucz48QXV0aG5TdGF0ZW1lbnQgQXV0aG5JbnN0YW50PSIyMDE1LTA5LTE2VDE3OjMxOjQ0LjQxOVoiPjxBdXRobkNvbnRleHQ%2BPEF1dGhuQ29udGV4dENsYXNzUmVmPnVybjpmZWRlcmF0aW9uOmF1dGhlbnRpY2F0aW9uOndpbmRvd3M8L0F1dGhuQ29udGV4dENsYXNzUmVmPjwvQXV0aG5Db250ZXh0PjwvQXV0aG5TdGF0ZW1lbnQ%2BPC9Bc3NlcnRpb24%2BPC9zYW1scDpSZXNwb25zZT4%3D' +
        '</textarea><input type="submit"/></form>'
    res.send(form);

});
app.post('/login/callback',
    passport.authenticate('saml', { session:false, failureRedirect: '/', failureFlash: true }),
    function(req, res) {
        res.type('application/json');
        console.log(req)
        res.send(res.user)
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

