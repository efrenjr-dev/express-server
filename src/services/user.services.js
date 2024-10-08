const httpStatus = require("http-status");
const logger = require("../config/logger");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

/**
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
    }
    return User.create(userBody);
};

/**
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
    return User.findById(id);
};

/**
 *
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    return User.findOne({ email });
};

/**
 *
 * @returns {Promise<User>}
 */
const getAllUsers = async () => {
    return User.find({});
};

/**
 *
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUser = async (userId, updateBody) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    if (
        updateBody.email &&
        (await User.isEmailTaken(updateBody.email, userId))
    ) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }
    Object.assign(user, updateBody);
    await user.save();
    return user;
};

module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateUser,
};
