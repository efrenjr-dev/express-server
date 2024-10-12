const express = require("express");
const { auth } = require("../../middlewares/auth");
const { userController } = require("../../controllers/");
const { userValidation } = require("../../validations");
const validator = require("express-joi-validation").createValidator({
    passError: true,
});

const router = express.Router();

router
    .route("/")
    .get(auth("getUsers"), userController.getUsers)
    .post(
        auth("manageUsers"),
        validator.body(userValidation.createUser),
        userController.createUser
    );

router
    .route("/:userId")
    .get(
        auth("getUsers"),
        validator.params(userValidation.paramsUserId),
        userController.getUser
    )
    .patch(
        auth("manageUsers"),
        validator.params(userValidation.paramsUserId),
        validator.body(userValidation.updateUser),
        userController.updateUser
    );

module.exports = router;
