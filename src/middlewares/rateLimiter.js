const rateLimit = require("express-rate-limit");
const config = require("../config/config");

const authLimiter = rateLimit({
    windowMs: config.rateLimit.windowMinutes * 60 * 1000,
    max: config.rateLimit.maxRequests,
    skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests,
});

module.exports = { authLimiter };
