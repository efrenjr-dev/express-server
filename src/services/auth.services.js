const httpStatus = require("http-status");
const { userServices } = require("../services");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");

/**
 *
 * @param {string} email
 * @param {string} password
 * @returns {User}
 */
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

module.exports = {
    loginUserWithEmailAndPassword,
};
