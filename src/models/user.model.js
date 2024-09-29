const mongoose = require("mongoose");
const validator = require("validator");
const { roles } = require("../config/roles");

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid email");
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
            validate(value) {
                if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                    throw new Error(
                        "Password must contain at least one letter and one number"
                    );
                }
            },
        },
        role: {
            type: String,
            enum: roles,
            default: "user",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

userSchema.statics.isEmailTaken = async function (email) {
    const user = await this.findOne({ email });
    return !!user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
