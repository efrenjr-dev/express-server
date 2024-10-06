const Joi = require("joi");

const register = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .max(25)
        .required()
        .regex(/\d/, "at least 1 number required")
        .regex(/[a-zA-Z]/, "at least 1 letter required"),
});

const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .max(25)
        .required()
        .regex(/\d/, "at least 1 number required")
        .regex(/[a-zA-Z]/, "at least 1 letter required"),
});

module.exports = { register, login };
