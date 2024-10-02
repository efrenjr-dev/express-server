const express = require("express");
const { userController } = require("../../controllers/");
const { userValidation } = require("../../validations");
const validator = require("express-joi-validation").createValidator({
    passError: true,
});

const router = express.Router();

router
    .route("/")
    .get(userController.getAllUsers)
    .post(validator.body(userValidation.createUser), userController.createUser);

router
    .route("/:userId")
    .get(validator.params(userValidation.paramsUserId), userController.getUser)
    .put(
        validator.params(userValidation.paramsUserId),
        validator.body(userValidation.updateUser),
        userController.updateUser
    );

module.exports = router;
