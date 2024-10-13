const moment = require("moment");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const logger = require("../config/logger");
const config = require("../config/config");
const { tokenTypes } = require("../config/tokens");
const Token = require("../models/token.model");
const userService = require("./user.services");
const { xprisma, prisma } = require("../utils/prisma");

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
    if (type === tokenTypes.VERIFY_EMAIL) {
        secret = config.jwt.emailTokenSecret;
    }
    if (type === tokenTypes.RESET_PASSWORD) {
        secret = config.jwt.resetPasswordTokenSecret;
    }
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expirationClaim.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};

/**
 *
 * @param {string} token
 * @param {ObjectId} userId
 * @param {string} type
 * @param {Date} expirationClaim
 * @returns {Promise<Object>}
 */
const saveToken = async (token, userId, type, expirationClaim) => {
    // const tokenDoc = await Token.create({
    //     token,
    //     user: userId,
    //     expires: expirationClaim.toDate(),
    //     type,
    // });

    const tokenDoc = await xprisma.token.create({
        data: {
            token: token,
            userId: userId,
            expires: expirationClaim.toDate(),
            type: type,
        },
    });
    return tokenDoc;
};

const blacklistToken = async (token) => {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    // const tokenUpdate = await Token.updateOne(
    //     {
    //         token: hashedToken,
    //         blacklisted: false,
    //     },
    //     { $set: { blacklisted: true } }
    // );
    // if (!tokenUpdate.acknowledged) {
    //     throw new Error("Token not updated");
    // }
    const tokenUpdate = await xprisma.token.updateMany({
        where: { token: hashedToken, blacklisted: false },
        data: { blacklisted: true },
    });
    return !!tokenUpdate;
};

/**
 *
 * @param {string} token
 * @param {string} type
 * @param {string} secret
 * @returns {Promise<Object>}
 */
const verifyToken = async (token, type, secret = "") => {
    logger.debug("VERIFY TOKEN SERVICE");
    if (type === tokenTypes.ACCESS) {
        secret = config.jwt.accessTokenSecret;
    }
    if (type === tokenTypes.REFRESH) {
        secret = config.jwt.refreshTokenSecret;
    }
    if (type === tokenTypes.VERIFY_EMAIL) {
        secret = config.jwt.emailTokenSecret;
    }
    if (type === tokenTypes.RESET_PASSWORD) {
        secret = config.jwt.resetPasswordTokenSecret;
    }
    const payload = jwt.verify(token, secret);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    // const tokenDoc = await Token.findOne({
    //     token: hashedToken,
    //     user: payload.sub,
    //     type: type,
    //     blacklisted: false,
    // });
    const tokenDoc = await prisma.token.findFirstOrThrow({
        where: {
            token: hashedToken,
            userId: payload.sub,
            type: type,
            blacklisted: false,
        },
    });

    // if (!tokenDoc) {
    //     throw new Error("Token not found");
    // }
    return tokenDoc;
};

/**
 *
 * @param {ObjectId} user
 * @returns {Promise<Object>}
 */
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

/**
 *
 * @param {ObjectId} user
 * @returns {Promise<string>}
 */
const generateEmailVerificationToken = async (user) => {
    const emailVerificationExpiry = moment().add(
        config.jwt.emailExpirationMinutes,
        "minutes"
    );
    const emailVerificationToken = generateToken(
        user.id,
        emailVerificationExpiry,
        tokenTypes.VERIFY_EMAIL
    );
    await saveToken(
        emailVerificationToken,
        user.id,
        tokenTypes.VERIFY_EMAIL,
        emailVerificationExpiry
    );
    return emailVerificationToken;
};

const generateResetPasswordToken = async (email) => {
    const user = await userService.getUserByEmail(email);
    const resetPasswordExpiry = moment().add(
        config.jwt.resetPasswordExpirationMinutes,
        "minutes"
    );
    const resetPasswordToken = generateToken(
        user.id,
        resetPasswordExpiry,
        tokenTypes.RESET_PASSWORD
    );
    await saveToken(
        resetPasswordToken,
        user.id,
        tokenTypes.RESET_PASSWORD,
        resetPasswordExpiry
    );
    return resetPasswordToken;
};

module.exports = {
    generateAuthTokens,
    verifyToken,
    blacklistToken,
    generateEmailVerificationToken,
    generateResetPasswordToken,
};
