const nodemailer = require("nodemailer");
const htmlToText = require("nodemailer-html-to-text").htmlToText;

module.exports = (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        name: process.env.SMTP_NAME,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            type: process.env.SMTP_AUTH,
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        secureConnection: process.env.SMTP_SCUR === "true",
        tls: {
            rejectUnauthorized: false,
            ciphers: "SSLv3"
        }
    });
    transporter.use("compile", htmlToText());

    return new Promise((resolve, reject) => {
        transporter.verify((err, success, priority = "normal") => {
            if (err) {
                reject(err);
            } else if (success) {
                const data = {
                    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_ADDR}>`,
                    to,
                    subject,
                    html,
                    replyTo: process.env.SMTP_FROM_ADDR,
                    encoding: "utf-8",
                    priority
                };

                transporter.sendMail(data, (err, info) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(info);
                    }
                });
            }
        });
    });
};
