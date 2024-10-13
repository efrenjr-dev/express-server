const { Prisma, PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const config = require("../config/config");

// use xprisma extended client for:
//  (user and token) - create and update
//  (user) - isEmailTaken method
const myExtension = Prisma.defineExtension({
    query: {
        user: {
            async $allOperations({ model, operation, args, query }) {
                if (["create", "update"].includes(operation)) {
                    if (args.data["password"]) {
                        args.data["password"] = await bcrypt.hash(
                            args.data["password"],
                            config.salt
                        );
                    }
                }
                return query(args);
            },
        },
        token: {
            async $allOperations({ model, operation, args, query }) {
                if (["create", "update"].includes(operation)) {
                    if (args.data["token"]) {
                        args.data["token"] = await crypto
                            .createHash("sha256")
                            .update(args.data["token"])
                            .digest("hex");
                    }
                }
                return query(args);
            },
        },
    },
    model: {
        user: {
            async isEmailTaken(email, excludeUserId) {
                const user = await prisma.user.findUnique({
                    where: { email: email, NOT: { id: excludeUserId } },
                    select: { email: true },
                });
                return !!user;
            },
        },
    },
});

const prisma = new PrismaClient();
const xprisma = prisma.$extends(myExtension);
module.exports = { prisma, xprisma };
