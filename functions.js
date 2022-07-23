const path = require("path");
const fs = require("fs");
const jsdom = require("jsdom");
const mail = require("./services/mailer");
const crypto = require("crypto");
const md5 = require("blueimp-md5");

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
    const sha256 = crypto.createHash("sha256", password);
    const hash = sha256.digest("base64");

    return hash;
};

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

const getGravatarUrl = (email, s = 256, d = "identicon", r = "g", img = false, atts = []) => {
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

module.exports = { securePassword, getHashedPassword, getGravatarUrl, validateEmail, validatePassword };
