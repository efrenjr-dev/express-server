const passport = require("passport");
const { roleRights } = require("../config/roles");
const logger = require("../config/logger");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const verify =
    (req, resolve, reject, requiredRights) => async (err, user, info) => {
        if (err || info || !user) {
            // logger.debug(`Error: ${err}`);
            // logger.debug(`Info: ${info}`);
            return reject(
                new ApiError(
                    httpStatus.UNAUTHORIZED,
                    err ? err : info ? info : "Please authenticate"
                )
            );
        }
        logger.debug(`User role: ${user.role}`);
        req.user = user;

        if (requiredRights.length) {
            const userRights = roleRights.get(user.role);
            const hasRequiredRights = requiredRights.every((requiredRight) =>
                userRights.includes(requiredRight)
            );
            if (!hasRequiredRights) {
                return reject(
                    new ApiError(
                        httpStatus.FORBIDDEN,
                        "User does not have access"
                    )
                );
            }
        }

        resolve();
    };

const auth =
    (...requiredRights) =>
    async (req, res, next) => {
        return new Promise((resolve, reject) => {
            passport.authenticate(
                "jwt",
                { session: false },
                verify(req, resolve, reject, requiredRights)
            )(req, res, next);
        })
            .then(() => next())
            .catch((err) => next(err));
    };

module.exports = { auth };
