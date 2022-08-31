const crypto = require("crypto");

import env from "../../env.json";

function isMdBreakpoint() {
    const result = window.matchMedia("(min-width: 768px)").matches;
    return result;
}

function capitalize(sentence) {
    return sentence.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
}

function wait(duration) {
    const t = Date.now();

    while (true) {
        if (Date.now() - t > duration) {
            return true;
        }
    }
}

function getNowTs() {
    return Math.floor(Date.now() / 1000);
}

function getDelay(expires) {
    let delay = Math.floor(expires - getNowTs());
    if (delay < 0) {
        delay = 0;
    }
    return delay;
}

function secondsToHuman(
    seconds,
    showSeconds = true,
    locales = { years: "années", days: "jours", hours: "heures", minutes: "minutes", seconds: "secondes" }
) {
    const levels = [
        [Math.floor(seconds / 31536000), locales.years],
        [Math.floor((seconds % 31536000) / 86400), locales.days],
        [Math.floor(((seconds % 31536000) % 86400) / 3600), locales.hours],
        [Math.floor(((((seconds + (showSeconds ? 0 : 60)) % 31536000) % 86400) % 3600) / 60), locales.minutes]
    ];
    if (showSeconds) {
        levels.push([Math.floor((((seconds % 31536000) % 86400) % 3600) % 60), locales.seconds]);
    }
    let returntext = "";

    for (let i = 0, max = levels.length; i < max; i++) {
        if (levels[i][0] === 0) continue;
        returntext +=
            " " +
            (levels[i][0] < 10 ? "0" : "") +
            levels[i][0] +
            " " +
            (levels[i][0] === 1 ? levels[i][1].substr(0, levels[i][1].length - 1) : levels[i][1]);
    }

    return returntext.trim();
}

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
        const make = () =>
            Array.apply(null, { length: length })
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

        let password = make();

        const hasLowerCase = (testValue) => new RegExp(`^(?=.*[a-z])`).test(testValue);
        const hasUpperCase = (testValue) => new RegExp(`^(?=.*[A-Z])`).test(testValue);
        const hasDigit = (testValue) => new RegExp(`^(?=.*[0-9])`).test(testValue);
        const hasSpecialChar = (testValue) =>
            new RegExp(
                `^(?=.*[\\!\\@\\#\\$\\%\\^\\&\\*\\)\\(\\+\\=\\.\\<\\>\\{\\}\\[\\]\\:\\;\\'\\"\\|\\~\`\\_\\-])`
            ).test(testValue);
        const hasMinLength = (testValue) => new RegExp(`^(?=.{8,})`).test(testValue);
        const isValid = (testValue) =>
            hasLowerCase(testValue) &&
            hasUpperCase(testValue) &&
            hasDigit(testValue) &&
            hasSpecialChar(testValue) &&
            hasMinLength(testValue);

        while (!isValid(password)) {
            password = make();
        }

        return password;
    }
};

function isValidToken(token) {
    return token && token.length === env.TOKENS_LENGTH * 2 && /^[0-9a-fA-F]+$/.test(token);
}

module.exports = { isMdBreakpoint, capitalize, wait, getNowTs, getDelay, secondsToHuman, securePassword, isValidToken };
