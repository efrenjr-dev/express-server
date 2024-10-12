const mongoose = require("mongoose");
const config = require("../config/config");
const logger = require("../config/logger");

mongoose.Promise = global.Promise;

const connectMongooseDb = async () =>
    mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
        logger.info(`Connected to MongoDB`);
    });

module.exports = connectMongooseDb;
