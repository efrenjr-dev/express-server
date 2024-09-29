const Joi = require("joi");

const createUser = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .max(25)
        .required()
        .regex(/\d/, "at least 1 letter")
        .regex(/[a-zA-Z]/, "at least 1 number"),
});

const getUser = Joi.object({
    userId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/, "object Id"),
});

module.exports = { createUser, getUser };
