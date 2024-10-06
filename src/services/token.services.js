const moment = require("moment");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const logger = require("../config/logger");
const { tokenTypes } = require("../config/tokens");
const Token = require("../models/token.model");

/**
 *
 * @param {string} userId
 * @param {string} secret
 * @param {Date} expires
 * @returns {string}
 */
const generateToken = (userId, expirationClaim, type, secret = "") => {
    if (type === tokenTypes.ACCESS) {
        secret = config.jwt.accessTokenSecret;
    } else if (type === tokenTypes.REFRESH) {
        secret = config.jwt.refreshTokenSecret;
    }
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expirationClaim.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};

const saveToken = async (token, userId, type, expirationClaim) => {
    const tokenDoc = await Token.create({
        token,
        userId,
        expires: expirationClaim.toDate(),
        type,
    });
    return tokenDoc;
};

//verifyToken

const generateAuthTokens = async (user) => {
    const accessExpiry = moment().add(
        config.jwt.accessExpirationMinutes,
        "minutes"
    );
    const accessToken = generateToken(user.id, accessExpiry, tokenTypes.ACCESS);

    const refreshExpiry = moment().add(
        config.jwt.refreshExpirationDays,
        "days"
    );
    const refreshToken = generateToken(
        user.id,
        refreshExpiry,
        tokenTypes.REFRESH
    );

    const tokenDoc = await saveToken(
        refreshToken,
        user.id,
        tokenTypes.REFRESH,
        refreshExpiry
    );
    logger.debug(`tokenDoc: ${tokenDoc}`);

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

module.exports = { generateAuthTokens };
