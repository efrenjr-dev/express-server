const { ExtractJwt, Strategy: JwtStrategy } = require("passport-jwt");
const config = require("./config");
const User = require("../models/user.model");

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken,
    secretOrKey: config.jwt.accessTokenSecret,
};

const verifyJwt = (jwt_payload, done) => {
    User.findById(jwt_payload.sub, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    });
};

const passportJwtStrategy = new JwtStrategy(jwtOptions, verifyJwt);

module.exports = { passportJwtStrategy };
