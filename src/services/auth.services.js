const httpStatus = require("http-status");
const userService = require("./user.services");
const tokenService = require("./token.services");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns {User}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await userService.getUserByEmail(email);
    if (!user || !user.isPasswordMatch(password)) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "User email does exist or password is incorrect."
        );
    }
    return user;
};

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

module.exports = {
    loginUserWithEmailAndPassword,
    refreshAuth,
};
