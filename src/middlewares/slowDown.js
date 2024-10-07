const slowDown = require("express-slow-down");
const config = require("../config/config");

const slowLimit = slowDown({
    windowMs: config.slowDown.windowMinutes * 60 * 1000,
    delayAfter: config.slowDown.delayAfter,
    delayMs: () => config.slowDown.delayMilliseconds,
});

module.exports = { slowLimit };
