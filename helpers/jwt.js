const expressJwt = require("express-jwt");
const api = process.env.API_URL;

function authJwt(){
    const secret = process.env.secret;
    return expressJwt({
        secret,
        algorithms: ["HS256"],
        isRevoked: isRevoked
    })
    .unless({
        path: [
            {url: /\/api\/v1\/users\/login/, methods: ["POST"]},
            {url: /\/public\/uploads(.*)/,methods: ["GET","OPTIONS"]},
            {url: /\/api\/v1\/products(.*)/, methods: ["GET","OPTIONS"]},
            {url: /\/api\/v1\/categories(.*)/, methods: ["GET","OPTIONS"]}
        ]
    });
}

async function isRevoked(req,payload, done){
    if(!payload.isAdmin){
        done(null,true);
    }
    done();
}

module.exports = authJwt;