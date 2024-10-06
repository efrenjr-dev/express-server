const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { tokenTypes } = require("../config/tokens");

const tokenSchema = mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: [
                tokenTypes.REFRESH,
                tokenTypes.RESET_PASSWORD,
                tokenTypes.VERIFY_EMAIL,
            ],
            required: true,
        },
        expires: {
            type: Date,
            required: true,
        },
        blacklisted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

tokenSchema.pre("save", async function (next) {
    const token = this;
    if (token.isModified("token")) {
        token.token = await bcrypt.hash(token.token, 10);
    }
    next();
});

/**
 * @typedef {Object} Token
 */
const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
