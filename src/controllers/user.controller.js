const httpStatus = require("http-status");
const logger = require("../config/logger");
const { userServices } = require("../services");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const createUser = async (req, res, next) => {
    try {
        logger.debug("CREATE USER");
        const user = await userServices.createUser(req.body);
        res.status(httpStatus.CREATED).send(user);
    } catch (error) {
        next(error);
    }
};

const getUser = catchAsync(async (req, res) => {
    logger.debug("GET USER");
    const user = await userServices.getUserById(req.params.userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    res.status(httpStatus.FOUND).send(user);
});

const getAllUsers = catchAsync(async (req, res) => {
    logger.debug("GET ALL USERS");
    const users = await userServices.getAllUsers();
    if (!users) {
        throw new ApiError(httpStatus.NOT_FOUND, "No users found");
    }
    res.status(httpStatus.FOUND).send(users);
});

const updateUser = catchAsync(async (req, res) => {
    logger.debug("UPDATE USER");
    const user = await userServices.updateUser(req.params.userId, req.body);
    if (!user) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Unable to update user record"
        );
    }
    res.status(httpStatus.ACCEPTED).send(user);
});

module.exports = { createUser, getUser, getAllUsers, updateUser };
