const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { prisma, xprisma } = require("../utils/prisma");
const logger = require("../config/logger");

/**
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
    if (await xprisma.user.isEmailTaken(userBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
    }
    return await xprisma.user.create({
        data: {
            name: userBody.name,
            email: userBody.email,
            password: userBody.password,
        },
    });
};

/**
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
    return await prisma.user.findUnique({ where: { id: id } });
};

/**
 *
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    return await prisma.user.findUnique({ where: { email: email } });
};

/**
 *
 * @returns {Promise<User>}
 */
const getUsers = async (searchString, skip, take) => {
    return prisma.user.findMany({
        skip: parseInt(skip),
        take: parseInt(take),
        where: {
            OR: [{ email: { contains: searchString } }],
        },
        orderBy: {
            email: "asc",
        },
    });
};

/**
 *
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUser = async (userId, updateBody) => {
    logger.debug(`updateBody.email ${updateBody.email}`);
    if (
        updateBody.email &&
        (await xprisma.user.isEmailTaken(updateBody.email, userId))
    ) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }

    const updatedUser = await xprisma.user.update({
        where: { id: userId },
        data: updateBody,
    });

    return updatedUser;
};

module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
    getUsers,
    updateUser,
};
