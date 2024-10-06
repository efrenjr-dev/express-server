const httpStatus = require("http-status");
const logger = require("../config/logger");
const { authServices, tokenServices, userServices } = require("../services");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res, next) => {
    logger.debug("REGISTER USER");
    const user = await userServices.createUser(req.body);
    const tokens = tokenServices.generateAuthTokens(user);
    res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res, next) => {
    logger.debug("LOGIN USER");
    const { email, password } = req.body;
    const user = await authServices.loginUserWithEmailAndPassword(
        email,
        password
    );
    const tokens = tokenServices.generateAuthTokens(user);
    res.status(httpStatus.OK).send({ user, tokens });
});

module.exports = { register, login };
