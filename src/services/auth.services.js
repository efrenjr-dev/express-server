const httpStatus = require("http-status");
const logger = require("../config/logger");
const userService = require("./user.services");
const tokenService = require("./token.services");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");
const User = require("../models/user.model");
const Token = require("../models/token.model");

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUser = async (email, password) => {
    const user = await userService.getUserByEmail(email);
    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "User email does exist or password is incorrect."
        );
    }
    if (!user.isEmailVerified) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Your email has not been verified"
        );
    }
    if (!user.isActive) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "User is account is not active."
        );
    }
    return user;
};

/**
 *
 * @param {string} oldRefreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (oldRefreshToken) => {
    const refreshTokenDoc = await tokenService.verifyToken(
        oldRefreshToken,
        tokenTypes.REFRESH
    );
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
    }
    await tokenService.blacklistToken(oldRefreshToken);
    return await tokenService.generateAuthTokens(user);
};

/**
 *
 * @param {Object} token
 */
const verifyEmail = async (token) => {
    try {
        // logger.debug("VERIFY EMAIL SERVICE");
        const verifyEmailTokenDoc = await tokenService.verifyToken(
            token,
            tokenTypes.VERIFY_EMAIL
        );
        const user = await userService.getUserById(verifyEmailTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        await Token.deleteMany({
            user: user.id,
            type: tokenTypes.VERIFY_EMAIL,
        });
        await userService.updateUser(user.id, { isEmailVerified: true });
    } catch (error) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Email verification failed"
        );
    }
};

const resetPassword = async (token, newPassword) => {
    try {
        logger.debug("RESET PASSWORD SERVICE");
        const resetPasswordTokenDoc = await tokenService.verifyToken(
            token,
            tokenTypes.RESET_PASSWORD
        );
        logger.debug(`resetPasswordTokenDoc: ${resetPasswordTokenDoc}`);
        const user = await userService.getUserById(resetPasswordTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        logger.debug(`user: ${user}`);
        await userService.updateUser(user.id, { password: newPassword });
        await Token.deleteMany({
            user: user.id,
            type: tokenTypes.RESET_PASSWORD,
        });
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Failed to reset password");
    }
};

module.exports = {
    loginUser,
    refreshAuth,
    verifyEmail,
    resetPassword,
};
