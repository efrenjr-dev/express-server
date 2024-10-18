const { ExtractJwt, Strategy: JwtStrategy } = require("passport-jwt");
const config = require("./config");
const { prisma } = require("../utils/prisma");

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
    secretOrKey: config.jwt.accessTokenSecret,
};

const verifyJwt = (jwt_payload, done) => {
    prisma.user
        .findUnique({ where: { id: jwt_payload.sub } })
        .then((user) => {
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        })
        .catch((err) => {
            return done(err, false);
        });
};

const passportJwtStrategy = new JwtStrategy(jwtOptions, verifyJwt);

module.exports = { passportJwtStrategy };
