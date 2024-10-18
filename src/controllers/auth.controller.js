const httpStatus = require("http-status");
const logger = require("../config/logger");
const {
    authService,
    tokenService,
    userService,
    emailService,
} = require("../services");
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

const forgotPassword = catchAsync(async (req, res) => {
    logger.debug("FORGOT PASSWORD");
    const user = await userService.getUserByEmail(req.body.email);
    if (user) {
        const resetPasswordToken =
            await tokenService.generateResetPasswordToken(req.body.email);
        await emailService.sendResetPasswordEmail(
            req.body.email,
            resetPasswordToken
        );
    }

    res.status(httpStatus.NO_CONTENT).send();
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
    await authService.verifyEmail(req.query.token);
    res.status(httpStatus.ACCEPTED).send("Email has been verified.");
});

const resetPassword = catchAsync(async (req, res) => {
    logger.debug("RESET PASSWORD");
    await authService.resetPassword(req.query.token, req.body.password);
    res.status(httpStatus.ACCEPTED).send("Password has been reset.");
});

module.exports = {
    register,
    login,
    refreshTokens,
    sendVerificationEmail,
    verifyEmail,
    resetPassword,
    forgotPassword,
};
