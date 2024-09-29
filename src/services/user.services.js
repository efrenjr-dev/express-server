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

module.exports = { createUser, getUserById, getUserByEmail };
