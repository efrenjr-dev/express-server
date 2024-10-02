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

const paramsUserId = Joi.object({
    userId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/, "object Id"),
});

const updateUser = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string()
        .min(8)
        .max(25)
        .regex(/\d/, "at least 1 letter")
        .regex(/[a-zA-Z]/, "at least 1 number"),
});

module.exports = { createUser, paramsUserId, updateUser };
