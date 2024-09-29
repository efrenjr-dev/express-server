const app = require("./app");
const mongoose = require("mongoose");
const config = require("./config/config");
const logger = require("./config/logger");

let server;

mongoose.Promise = global.Promise;

// Connect MongoDB at default port 27017.
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
    logger.info(`Connected to MongoDB`);
    server = app.listen(config.port, () => {
        logger.info(`Listening to port ${config.port}`);
    });
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info("Server closed");
        });
    }
    process.exit(1);
};

const unexpectedErrorHandler = (error) => {
    logger.error(error);
    exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
    logger.info("SIGTERM received");
    if (server) {
        server.close();
    }
});
