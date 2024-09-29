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

const getUser = catchAsync(async (req, res, next) => {
    logger.debug("GET USER");
    const user = await userServices.getUserById(req.params.userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    res.status(httpStatus.FOUND).send(user);
});

module.exports = { createUser, getUser };
