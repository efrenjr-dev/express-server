const httpStatus = require("http-status");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const { prisma, xprisma } = require("../utils/prisma");
const logger = require("../config/logger");

/**
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
    // if (await User.isEmailTaken(userBody.email)) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
    // }

    // return await User.create(userBody);

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
    // return User.findById(id);
    return await prisma.user.findUnique({ where: { id: id } });
};

/**
 *
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    // return User.findOne({ email });
    return await prisma.user.findUnique({ where: { email: email } });
};

/**
 *
 * @returns {Promise<User>}
 */
const getUsers = async (searchString, skip, take) => {
    // const or =
    //     searchString !== undefined
    //         ? {
    //               $or: [
    //                   { email: { $regex: searchString, $options: "i" } },
    //                   { id: { $regex: searchString, $options: "i" } },
    //               ],
    //           }
    //         : {};

    // return User.find({ ...or }, null, { skip, batchSize: take });

    return prisma.user.findMany({
        skip: parseInt(skip),
        take: parseInt(take),
        where: {
            OR: [
                { email: { contains: searchString } },
                // { id: { contains: searchString } },
            ],
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
    // const user = await getUserById(userId);
    // if (!user) {
    //     throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    // }
    // if (
    //     updateBody.email &&
    //     (await user.isEmailTaken(updateBody.email, userId))
    // ) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    // }
    // Object.assign(user, updateBody);
    // await user.save();
    // return user;
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
