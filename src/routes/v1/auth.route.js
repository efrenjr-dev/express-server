const express = require("express");
const { authController } = require("../../controllers");
const { authValidation } = require("../../validations");
const { auth } = require("../../middlewares/auth");
const validator = require("express-joi-validation").createValidator({
    passError: true,
});
const logger = require("../../config/logger");

const router = express.Router();

router.post(
    "/register",
    validator.body(authValidation.register),
    authController.register
);
router.post(
    "/login",
    validator.body(authValidation.login),
    authController.login
);
router.post("/refresh", authController.refreshTokens);

router.post(
    "/send-verification-email",
    auth(),
    authController.sendVerificationEmail
);

router.post("/verify-email", authController.verifyEmail);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
