const httpStatus = require("http-status");
const logger = require("../config/logger");
const {
    authService,
    tokenService,
    userService,
    emailService,
} = require("../services");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { tokenTypes } = require("../config/tokens");
const { blacklistToken } = require("../services/token.services");

const register = catchAsync(async (req, res) => {
    logger.debug("REGISTER USER");
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
    logger.debug("LOGIN USER");
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.OK).send({ user, tokens });
});

const refreshTokens = catchAsync(async (req, res) => {
    logger.debug("REFRESH AUTH TOKENS");
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAuth(refreshToken);
    res.status(httpStatus.OK).send({ ...tokens });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
    logger.debug("SEND VERIFICATION EMAIL");
    const emailVerificationToken =
        await tokenService.generateEmailVerificationToken(req.user);
    await emailService.sendVerificationEmail(
        req.user.email,
        req.user.name,
        emailVerificationToken
    );
    res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
    logger.debug("VERIFY EMAIL");
    logger.debug(`token: ${req.query.token}`);
    await authService.verifyEmail(req.query.token);
    res.status(httpStatus.ACCEPTED, "Email has been verified.").send();
});

module.exports = {
    register,
    login,
    refreshTokens,
    sendVerificationEmail,
    verifyEmail,
};
