const path = require("path");
const fs = require("fs");
const jsdom = require("jsdom");
const mail = require("./services/mailer");
const crypto = require("crypto");
const md5 = require("blueimp-md5");
const passwordHash = require("password-hash");

const sleep = (waitTimeInMs) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

const expressMail = async (templateFilename, to, vars = {}) => {
    return new Promise((resolve, reject) => {
        const templateFile = path.join(__dirname, "templates", process.env.APP_LANG, templateFilename);
        if (!fs.existsSync(templateFile)) {
            reject({ code: 500, message: "No mail (template file) to send." });
        }

        fs.readFile(templateFile, "utf8", (err, data) => {
            if (err) {
                console.error(err);
                reject({ code: 500, message: `No mail to send. Corrupted template file.` });
            }

            let html = data || "";
            html = html.replaceAll("{{app_name}}", process.env.APP_NAME);
            Object.keys(vars).forEach((keyName) => {
                html = html.replaceAll(`{{${keyName}}}`, vars[keyName]);
            });

            const parsedHtml = new jsdom.JSDOM(html);
            const titleElement = parsedHtml.window.document.querySelector("title");

            mail(to, titleElement.text, html)
                .then((info) => {
                    if (info.accepted.includes(to)) {
                        resolve(info);
                    } else {
                        let reason = ".";
                        if (info.rejected.includes(to)) reason = ": totally rejected by destination server.";
                        if (info.pending.includes(to)) reason = ": temporarily rejected by destination server.";

                        reject({ code: 406, message: `Unable to send email to ${to}${reason}}` });
                    }
                })
                .catch((mailErr) => {
                    console.error("mail error:", mailErr);
                    reject({ code: 500, message: "Unable to send email." });
                });
        });
    });
};

const expressMultipleMail = (mailList) => {
    if (!Array.isArray(mailList)) return;

    mailList.forEach((mail, idx) => {
        if (typeof mail === "object" && "templateFile" in mail && "to" in mail && "vars" in mail) {
            sleep(process.env.SMTP_SPAM_DELAY * (idx + 1)).then(async () => {
                try {
                    await expressMail(mail.templateFile, mail.to, mail.vars);
                } catch (error) {
                    console.error(mail.to, ":", error);
                }
            });
        }
    });
};

const securePassword = {
    _pattern: /[a-zA-Z0-9_\-\+\.]/,

    _getRandomByte: function () {
        if (crypto && crypto.getRandomValues) {
            var result = new Uint8Array(1);
            crypto.getRandomValues(result);
            return result[0];
        } else {
            return Math.floor(Math.random() * 256);
        }
    },

    generate: function (length) {
        return Array.apply(null, { length: length })
            .map(function () {
                var result;
                while (true) {
                    result = String.fromCharCode(this._getRandomByte());
                    if (this._pattern.test(result)) {
                        return result;
                    }
                }
            }, this)
            .join("");
    }
};

const getHashedPassword = (password) => {
    return passwordHash.generate(password);
};

const verifyHashedPassword = (password, hashedPassword) => {
    return passwordHash.verify(password, hashedPassword);
};

function validateName(name) {
    return name.trim().length > 3;
}

function validateEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) ? true : false;
}

function validatePassword(password, level = 2) {
    const mediumValidation = new RegExp(
        "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})"
    );
    const strongValidation = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\\!\\@\\#\\$\\%\\^\\&\\*\\)\\(\\+\\=\\.\\<\\>\\{\\}\\[\\]\\:\\;\\'\"\\|\\~\\`\\_\\-])(?=.{10,})"
    );

    let validationLevel = 0;
    if (strongValidation.test(password.trim())) {
        validationLevel = 2;
    } else if (mediumValidation.test(password.trim())) {
        validationLevel = 1;
    }

    return password.trim() === password && validationLevel === (level < 0 ? 0 : level > 2 ? 2 : level);
}

const getGravatarUrl = (email, s = 512, d = "mp", r = "g", img = false, atts = []) => {
    let url = "https://www.gravatar.com/avatar/";
    url += md5(email.trim().toLowerCase());
    url += `?s=${s}&d=${d}&r=${r}`;

    if (img) {
        url = `<img src="${url}"`;
        Object.entries(atts).forEach((entry) => {
            const [key, value] = entry;
            url += ` ${key}="${value}"`;
        });
        url += ` />`;
    }

    return url;
};

module.exports = {
    sleep,
    expressMail,
    expressMultipleMail,
    securePassword,
    getHashedPassword,
    verifyHashedPassword,
    getGravatarUrl,
    validateEmail,
    validatePassword,
    validateName
};
