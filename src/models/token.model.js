const mongoose = require("mongoose");
const crypto = require("node:crypto");
const { tokenTypes } = require("../config/tokens");

const tokenSchema = mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            index: true,
        },
        user: {
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
        token.token = crypto
            .createHash("sha256")
            .update(token.token)
            .digest("hex");
    }
    next();
});

/**
 * @typedef {Object} Token
 */
const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
