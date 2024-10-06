const httpStatus = require("http-status");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const User = require("../models/user.model");
const { userServices } = require("../services");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await userServices.getUserByEmail(email);
    if (!user || !user.isPasswordMatch(password)) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "User email does exist or password is incorrect."
        );
    }
    return user;
};

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
    loginUserWithEmailAndPassword,
};
