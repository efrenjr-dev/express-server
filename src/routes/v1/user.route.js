const express = require("express");
const { userController } = require("../../controllers/");
const { userValidation } = require("../../validations");
const validator = require("express-joi-validation").createValidator({
    passError: true,
});

const router = express.Router();

router
    .route("/")
    .post(validator.body(userValidation.createUser), userController.createUser);

router
    .route("/:userId")
    .get(validator.params(userValidation.getUser), userController.getUser);

module.exports = router;
