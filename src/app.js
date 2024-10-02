const express = require("express");
const morgan = require("./config/morgan");
const cors = require("cors");
const helmet = require("helmet");
const httpStatus = require("http-status");
const { xss } = require("express-xss-sanitizer");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const ApiError = require("./utils/ApiError");
const { errorConverter, errorHandler } = require("./middlewares/error");
const config = require("./config/config");
const { authLimiter } = require("./middlewares/rateLimiter");
const routes = require("./routes/v1/");
const { passportJwtStrategy } = require("./config/passport");

const app = express();

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

if (config.env === "production") {
    app.use(authLimiter);
}

// app.use(
//     slowDown({
//         windowMs: 10 * 60 * 1000,
//         delayAfter: 1,
//         delayMs: () => 1000,
//     })
// );

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(xss());
app.use(mongoSanitize());
app.use(compression());
app.use(cors());
app.options("*", cors());

passport.use(passportJwtStrategy);

app.use("/v1", routes);

app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not Found"));
});

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
