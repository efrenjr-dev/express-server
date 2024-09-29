const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const config = require("../config/config");

const errorConverter = (err, req, res, next) => {
    logger.debug(`ApiError: ${err instanceof ApiError}`);
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode;
        const message =
            error.message || error.error.toString() || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);
    }
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (!err.isOperational) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = httpStatus[statusCode];
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(config.env === "development" && { stack: err.stack }),
    };

    if (config.env === "development") {
        logger.error(err);
    }

    res.status(statusCode).send(response);
};

module.exports = { errorConverter, errorHandler };
