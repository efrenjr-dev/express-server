const httpStatus = require("http-status");
const logger = require("../config/logger");
const { authServices, userServices } = require("../services");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res, next) => {
    logger.debug("REGISTER USER");
    const user = await userServices.createUser(req.body);
    const tokens = authServices.generateAuthTokens(user);
    res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res, next) => {
    logger.debug("LOGIN USER");
    res.status(httpStatus.OK).send("Logged In");
});

module.exports = { register, login };
