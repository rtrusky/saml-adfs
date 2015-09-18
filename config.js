var config = {
    samlStrategy: {
        path: '/login/callback',
        entryPoint: 'https://integrifyadfs.integrify.com/adfs/ls',
        issuer: "integrify-saml-client",
        protocol: "https://",
        cert: "idp-adfs.crt",
        acceptedClockSkewMs: -1,
        authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
        identifierFormat: null,
        signatureAlgorithm: 'sha256',
        loggerType: "dev"
    },
    integrify: {
        "service_user" : "iApprove",
        "integrify_base_url" : "http://localhost:3500",
        "consumer_key": "integrifyinstance",
        "consumer_secret": "s0nnyD8y",
        "fieldMap" : {
            "NameFirst": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
            "NameLast" : "http://schemas.xmlsoap.org/claims/CommonName",
            "Email" : "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
            "UserName" : "nameID",
            "Title":"http://schemas.microsoft.com/ws/2008/06/identity/claims/role"

        }
    }
}

module.exports = config;