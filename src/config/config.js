const Joi = require("joi");
const dotenv = require("dotenv");

dotenv.config();

const environmentVariablesSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string()
            .valid("production", "development", "test")
            .required(),
        PORT: Joi.number().default(3000),
        MONGODB_USER: Joi.string().required().description("Mongo DB username"),
        MONGODB_PASSWORD: Joi.string()
            .required()
            .description("Mongo DB password"),
        MONGODB_CLUSTER: Joi.string()
            .required()
            .description("Mongo DB cluster"),
        MONGODB_DB: Joi.string().required().description("Mongo DB database"),
        ACCESS_TOKEN_SECRET: Joi.string()
            .required()
            .description("Access token JWT secret key"),
        REFRESH_TOKEN_SECRET: Joi.string()
            .required()
            .description("Refresh token JWT secret key"),
        ACCESS_EXPIRATION_MINUTES: Joi.number()
            .required()
            .description("Minutes after which Access Token expires"),
        REFRESH_EXPIRATION_DAYS: Joi.number()
            .required()
            .description("Days after which Refresh Token expires"),
    })
    .prefs({ errors: { label: "key" } })
    .unknown();

const { value: environmentVariables, error } =
    environmentVariablesSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const mongoDbUrl = `mongodb+srv://${environmentVariables.MONGODB_USER}:${environmentVariables.MONGODB_PASSWORD}@${environmentVariables.MONGODB_CLUSTER}.2ttig.gcp.mongodb.net/${environmentVariables.MONGODB_DB}`;

module.exports = {
    env: environmentVariables.NODE_ENV,
    port: environmentVariables.PORT,
    mongoose: {
        url: mongoDbUrl,
        options: {}, //mongoose 6+ has defaults (useCreateIndex, useNewUrlParser, useUnifiedTopology)
    },
    jwt: {
        accessTokenSecret: environmentVariables.ACCESS_TOKEN_SECRET,
        refreshTokenSecret: environmentVariables.REFRESH_TOKEN_SECRET,
        accessExpirationMinutes: environmentVariables.ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: environmentVariables.REFRESH_EXPIRATION_DAYS,
    },
};
