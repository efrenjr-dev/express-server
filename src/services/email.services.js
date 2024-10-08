const nodemailer = require("nodemailer");
const logger = require("../config/logger");
const config = require("../config/config");

// Looking to send emails in production? Check out our Email API/SMTP product!
const transportSMTP = nodemailer.createTransport(config.email.smtp);

transportSMTP
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() =>
        logger.warn(
            "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
        )
    );

const sendEmail = async (to, subject, text) => {
    const msg = { from: config.email.from, to, subject, text };
    await transportSMTP.sendMail(msg);
};

/**
 *
 * @param {string} to
 * @param {string} name
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, name, token) => {
    const subject = "Email Verification Link";
    const link = `http://localhost:3000/v1/auth/verify-email?token=${token}`;
    const text = `Dear ${name},
    To verify your email, please click on the link ${link}`;
    await sendEmail(to, subject, text);
};

module.exports = { sendVerificationEmail };
