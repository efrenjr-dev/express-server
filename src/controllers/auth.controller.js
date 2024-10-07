const httpStatus = require("http-status");
const logger = require("../config/logger");
const { authService, tokenService, userService } = require("../services");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res) => {
    logger.debug("REGISTER USER");
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
    logger.debug("LOGIN USER");
    const { email, password } = req.body;
    const user = await authService.loginUserWithEmailAndPassword(
        email,
        password
    );
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.OK).send({ user, tokens });
});

const refreshTokens = catchAsync(async (req, res) => {
    logger.debug("REFRESH AUTH TOKENS");
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAuth(refreshToken);
    res.status(httpStatus.OK).send({ ...tokens });
});

module.exports = { register, login, refreshTokens };
