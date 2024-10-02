const express = require("express");
const { authController } = require("../../controllers");
const { userValidation } = require("../../validations");

const router = express.Router();

router.route("/register").post(authController.registerUser);

module.exports = router;
