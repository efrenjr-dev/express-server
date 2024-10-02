const httpStatus = require("http-status");
const moment = require("moment");
const logger = require("../config/logger");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

const generateAccessToken = (
    userId,
    secret = config.jwt.accessTokenSecret,
    expires = `${config.jwt.accessExpirationMinutes}m`
) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
    };
    return jwt.sign(payload, secret, {
        expiresIn: expires,
    });
};

const generateRefreshToken = (
    userId,
    secret = config.jwt.refreshTokenSecret,
    expires = `${config.jwt.refreshExpirationDays}d`
) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
    };
    return jwt.sign(payload, secret, {
        expiresIn: expires,
    });
};

const generateAuthTokens = (user) => {
    const accessToken = generateAccessToken(user.id);
    const accessExpiry = moment().add(
        config.jwt.accessExpirationMinutes,
        "minutes"
    );
    const refreshToken = generateRefreshToken(user.id);
    const refreshExpiry = moment().add(
        config.jwt.refreshExpirationDays,
        "days"
    );

    return {
        access: {
            token: accessToken,
            expires: accessExpiry.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshExpiry.toDate(),
        },
    };
};

module.exports = {
    generateAuthTokens,
};
