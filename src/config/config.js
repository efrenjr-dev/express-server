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
};
