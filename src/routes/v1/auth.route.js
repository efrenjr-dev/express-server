const express = require("express");
const { authController } = require("../../controllers");
const { authValidation } = require("../../validations");
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
router.get("/refresh");

module.exports = router;
