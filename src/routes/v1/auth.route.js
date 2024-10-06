const express = require("express");
const { authController } = require("../../controllers");
const { authValidation } = require("../../validations");

const router = express.Router();

router.post("/register", authValidation.register, authController.register);
router.post("/login", authController.login);

module.exports = router;
