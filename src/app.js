const express = require("express");
const morgan = require("./config/morgan");
const cors = require("cors");
const helmet = require("helmet");
const httpStatus = require("http-status");
const { xss } = require("express-xss-sanitizer");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const ApiError = require("./utils/ApiError");
const { errorConverter, errorHandler } = require("./middlewares/error");
const config = require("./config/config");
const { authLimiter } = require("./middlewares/rateLimiter");
const { slowLimit } = require("./middlewares/slowDown");
const routes = require("./routes/v1/");
const { passportJwtStrategy } = require("./config/passport");

const app = express();

if (config.env !== "test") {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);
}

if (config.env === "production") {
    app.use(rateLimiter);
    app.use(slowLimit);
}

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(xss());
app.use(mongoSanitize());
app.use(compression());

app.use(cors());
app.options("*", cors());

passport.use(passportJwtStrategy);

if (config.env === "production") {
    app.use("/v1/auth", authLimiter);
    // app.use("/v1", slowLimit);
}

app.use("/v1", routes);

app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not Found"));
});

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
