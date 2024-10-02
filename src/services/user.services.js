const httpStatus = require("http-status");
const logger = require("../config/logger");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const createUser = async (userBody) => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
    }
    return User.create(userBody);
};

const getUserById = async (id) => {
    return User.findById(id);
};

const getUserByEmail = async (email) => {
    return User.findOne({ email });
};

const getAllUsers = async () => {
    return User.find({});
};

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
