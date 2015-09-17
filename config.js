var config = {
    samlStrategy: {
        path: '/login/callback',
        entryPoint: 'https://integrifyadfs.integrify.com/adfs/ls',
        issuer: "integrify-saml-client",
        protocol: "https://",
        cert: "idp.crt",
        acceptedClockSkewMs: -1,
        authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
        identifierFormat: null,
        signatureAlgorithm: 'sha256',
        loggerType: "dev"
    },
    integrify: {
        "service_user" : "iApprove",
        "integrify_base_url" : "http://localhost:3000",
        "consumer_key": "integrifyinstance",
        "consumer_secret": "s0nnyD8y",
        "fieldMap" : {
            "NameFirst": "FirstName",
            "NameLast" : "LastNAme",
            "Email" : "Email",
            "UserName" : "UserID",
            "Phone":"Phone"

        }
    }
}

module.exports = config;