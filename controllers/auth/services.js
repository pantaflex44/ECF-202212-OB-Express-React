const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const ms = require("ms");

const { getGravatarUrl } = require("../../functions");
const { query, execute, emptyOrRows } = require("../../services/db");

const secureAccountData = (account) => {
    const { password, access_token, passwordlost_token, avatar_url, ...lightAccount } = account;

    return { ...lightAccount, avatar_url: avatar_url ?? getGravatarUrl(account.email) };
};

const getAccount = async (email, fn = null, onlyExists = false) => {
    const rows = emptyOrRows(
        await query("SELECT * FROM accounts WHERE email = $email", {
            $email: email
        })
    );

    if (rows.length !== 1) return { account: null, error: { code: 404, message: "Account not found." } };

    const account = rows[0];

    if (!onlyExists) {
        if (!account.active) return { account: null, error: { code: 403, message: "Account is not yet activated." } };
    }

    if (fn && !fn(account)) return { account: null, error: { code: 401, message: "Unauthorized." } };

    const { active, is_admin, ...rest } = account;
    return {
        account: {
            active: active === 1,
            is_admin: is_admin === 1,
            is_parter: is_admin === 0 && account.partner_id === 0,
            is_structure: is_admin === 0 && account.partner_id > 0,
            ...rest
        },
        error: null
    };
};

const generateToken = async (email, tokenType = "access_token") => {
    const { account, error } = await getAccount(email);
    if (account === null) return { token: "", expires: 0 };

    const token = crypto.randomBytes(64).toString("hex");
    await execute(`UPDATE accounts SET ${tokenType} = $token WHERE email = $email`, {
        $email: email,
        $token: token
    });

    const jwtToken = jwt.sign({ email, token }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    const expires = new Date((Math.floor(Date.now() / 1000) + ms(process.env.JWT_EXPIRE) / 1000) * 1000);

    return { jwtToken, expires };
};

const clearToken = async (email, tokenType = "access_token") => {
    const { account, error } = await getAccount(email);
    if (account === null) return false;

    await execute(`UPDATE accounts SET ${tokenType} = '' WHERE email = $email`, {
        $email: email
    });

    return true;
};

const refreshToken = async (jwtToken, tokenType = "access_token") => {
    return new Promise(async (resolve, reject) => {
        jwt.verify(jwtToken, process.env.JWT_SECRET, async (err, credentials) => {
            if (err) reject(err);

            const { email, token, exp } = credentials;

            const { account, error } = await getAccount(email, (account) => account[tokenType] === token);
            if (account === null) return reject({ ...error, name: "Account" });

            const data = await generateToken(account.email, tokenType);

            resolve({ account: secureAccountData(account), token: data.jwtToken, expires: data.expires });
        });
    });
};

module.exports = { getAccount, secureAccountData, generateToken, clearToken, refreshToken };
