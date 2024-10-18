const Joi = require("joi");
const dotenv = require("dotenv");

dotenv.config();

const environmentVariablesSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string()
            .valid("production", "development", "test")
            .required(),
        PORT: Joi.number().default(3000),
        SALT: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string()
            .required()
            .description("Access token JWT secret key"),
        REFRESH_TOKEN_SECRET: Joi.string()
            .required()
            .description("Refresh token JWT secret key"),
        EMAIL_TOKEN_SECRET: Joi.string()
            .required()
            .description("Email Verification token JWT secret key"),
        RESET_PASSWORD_TOKEN_SECRET: Joi.string()
            .required()
            .description("Reset Password token JWT secret key"),
        EMAIL_EXPIRATION_MINUTES: Joi.number()
            .required()
            .description(
                "Minutes after which Email Verification token expires"
            ),
        RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
            .required()
            .description("Minutes after which Reset Password token expires"),
        ACCESS_EXPIRATION_MINUTES: Joi.number()
            .required()
            .description("Minutes after which Access Token expires"),
        REFRESH_EXPIRATION_DAYS: Joi.number()
            .required()
            .description("Days after which Refresh Token expires"),
        RATE_LIMIT_WINDOW_MINUTES: Joi.number()
            .required()
            .description("Minutes after which rate limit restarts"),
        RATE_LIMIT_MAX_REQUESTS: Joi.number()
            .required()
            .description("Maximum requests within window"),
        RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: Joi.boolean()
            .required()
            .description("To skip limit count of successful requests"),
        SLOW_DOWN_WINDOW_MINUTES: Joi.number()
            .required()
            .description("Minutes after which slow down limit restarts"),
        SLOW_DOWN_DELAY_AFTER: Joi.number()
            .required()
            .description("Number of requests before slow down"),
        SLOW_DOWN_DELAY_MS: Joi.number()
            .required()
            .description("Milliseconds of request delay"),
        SMTP_HOST: Joi.string().required().description("SMTP Host"),
        SMTP_PORT: Joi.number().required().description("SMT Port to use"),
        SMTP_USERNAME: Joi.string().required().description("SMTP Username"),
        SMTP_PASSWORD: Joi.string().required().description("SMT password"),
        EMAIL_FROM: Joi.string()
            .required()
            .description("Email that appears on From field"),
    })
    .prefs({ errors: { label: "key" } })
    .unknown();

const { value: environmentVariables, error } =
    environmentVariablesSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    env: environmentVariables.NODE_ENV,
    port: environmentVariables.PORT,
    salt: environmentVariables.SALT,
    jwt: {
        accessTokenSecret: environmentVariables.ACCESS_TOKEN_SECRET,
        refreshTokenSecret: environmentVariables.REFRESH_TOKEN_SECRET,
        accessExpirationMinutes: environmentVariables.ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: environmentVariables.REFRESH_EXPIRATION_DAYS,
        emailTokenSecret: environmentVariables.EMAIL_TOKEN_SECRET,
        resetPasswordTokenSecret:
            environmentVariables.RESET_PASSWORD_TOKEN_SECRET,
        emailExpirationMinutes: environmentVariables.EMAIL_EXPIRATION_MINUTES,
        resetPasswordExpirationMinutes:
            environmentVariables.RESET_PASSWORD_EXPIRATION_MINUTES,
    },
    rateLimit: {
        windowMinutes: environmentVariables.RATE_LIMIT_WINDOW_MINUTES,
        maxRequests: environmentVariables.RATE_LIMIT_MAX_REQUESTS,
        skipSuccessfulRequests:
            environmentVariables.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS,
    },
    slowDown: {
        windowMinutes: environmentVariables.SLOW_DOWN_WINDOW_MINUTES,
        delayAfter: environmentVariables.SLOW_DOWN_DELAY_AFTER,
        delayMilliseconds: environmentVariables.SLOW_DOWN_DELAY_MS,
    },
    email: {
        smtp: {
            host: environmentVariables.SMTP_HOST,
            port: environmentVariables.SMTP_PORT,
            auth: {
                user: environmentVariables.SMTP_USERNAME,
                pass: environmentVariables.SMTP_PASSWORD,
            },
        },
        from: environmentVariables.EMAIL_FROM,
    },
};
