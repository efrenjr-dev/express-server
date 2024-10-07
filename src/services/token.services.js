const moment = require("moment");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
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
    }
    if (type === tokenTypes.REFRESH) {
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
        user: userId,
        expires: expirationClaim.toDate(),
        type,
    });
    return tokenDoc;
};

const blacklistToken = async (token) => {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const tokenUpdate = await Token.updateOne(
        {
            token: hashedToken,
            blacklisted: false,
        },
        { $set: { blacklisted: true } }
    );
    if (!tokenUpdate.acknowledged) {
        throw new Error("Token not updated");
    }
    return tokenUpdate.acknowledged;
};

const verifyToken = async (token, type, secret = "") => {
    if (type === tokenTypes.ACCESS) {
        secret = config.jwt.accessTokenSecret;
    }
    if (type === tokenTypes.REFRESH) {
        secret = config.jwt.refreshTokenSecret;
    }
    const payload = jwt.verify(token, secret);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const tokenDoc = await Token.findOne({
        token: hashedToken,
        user: payload.sub,
        type: type,
        blacklisted: false,
    });
    if (!tokenDoc) {
        throw new Error("Token not found");
    }
    return tokenDoc;
};

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

    await saveToken(refreshToken, user.id, tokenTypes.REFRESH, refreshExpiry);

    // logger.debug(`ACCESS TOKEN: ${accessToken}`);
    // logger.debug(`REFRESH TOKEN: ${refreshToken}`);
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

module.exports = { generateAuthTokens, verifyToken, blacklistToken };
