const crypto = require("crypto");

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

module.exports = { securePassword, getHashedPassword };
