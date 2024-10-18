const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const logger = require("../config/logger");
const userService = require("./user.services");
const tokenService = require("./token.services");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");
const { prisma } = require("../utils/prisma");
const emailService = require("./email.services");

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUser = async (email, password) => {
    const user = await userService.getUserByEmail(email);
    const isPasswordMatch = await bcrypt.compare(user.password, password);
    if (!user || isPasswordMatch) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "User email does exist or password is incorrect."
        );
    }
    if (!user.isActive) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "User is account is not active."
        );
    }
    if (!user.isEmailVerified) {
        const emailToken = await tokenService.generateEmailVerificationToken(
            user
        );
        await emailService.sendVerificationEmail(
            user.email,
            user.name,
            emailToken
        );
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Your email has not been verified. Please check your email."
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
    const user = await userService.getUserById(refreshTokenDoc.userId);
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
    const verifyEmailTokenDoc = await tokenService.verifyToken(
        token,
        tokenTypes.VERIFY_EMAIL
    );
    const user = await userService.getUserById(verifyEmailTokenDoc.userId);
    if (!user) {
        throw new Error();
    }
    await prisma.token.deleteMany({
        where: { userId: user.id, type: tokenTypes.VERIFY_EMAIL },
    });
    await userService.updateUser(user.id, { isEmailVerified: true });
};

const resetPassword = async (token, newPassword) => {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
        token,
        tokenTypes.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenDoc.userId);
    if (!user) {
        throw new Error();
    }
    await userService.updateUser(user.id, { password: newPassword });
    await Token.deleteMany({
        user: user.id,
        type: tokenTypes.RESET_PASSWORD,
    });
};

module.exports = {
    loginUser,
    refreshAuth,
    verifyEmail,
    resetPassword,
};
