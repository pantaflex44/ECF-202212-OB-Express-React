const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const ms = require("ms");

const { expressMail, getGravatarUrl, sleep, expressMultipleMail } = require("../../functions");
const { query, execute, emptyOrRows } = require("../../services/db");

const secureAccountData = (account) => {
    const { password, access_token, passwordlost_token, avatar_url, ...lightAccount } = account;

    return { ...lightAccount, avatar_url: avatar_url ?? getGravatarUrl(account.email) };
};

const cleanAccount = (account) => {
    const { active, is_admin, ...rest } = account;

    return {
        active: active === 1,
        is_admin: is_admin === 1,
        is_partner: is_admin === 0 && account.partner_id === 0,
        is_structure: is_admin === 0 && account.partner_id > 0,
        ...rest
    };
};

const getAccount = async (email, fn = null, onlyExists = false) => {
    const rows = emptyOrRows(await query("SELECT * FROM accounts WHERE email = $email", { $email: email }));

    if (rows.length !== 1) return { account: null, error: { code: 404, message: "Account not found." } };

    const account = rows[0];

    if (!onlyExists) {
        if (!account.active) return { account: null, error: { code: 403, message: "Account is not yet activated." } };
    }

    if (fn && !fn(account)) return { account: null, error: { code: 401, message: "Unauthorized." } };

    return {
        account: cleanAccount(account),
        error: null
    };
};

const getAccounts = async (fn = null) => {
    const rows = emptyOrRows(await query("SELECT * FROM accounts", {}));

    if (rows.length < 1) return [];

    let accounts = [...rows];
    if (fn) accounts = fn(accounts);

    accounts.map((account) => cleanAccount(account));

    return accounts;
};

const getPartner = async (partnerId) => {
    return await getAccounts((acs) => {
        return acs.filter((a) => a.id === partnerId);
    });
};

const getPartners = async () => {
    return await getAccounts((acs) => {
        return acs.filter((a) => a.is_admin === 0 && a.partner_id === 0);
    });
};

const getStructure = async (structureId) => {
    return await getAccounts((acs) => {
        return acs.filter((a) => a.id === structureId);
    });
};

const getPartnerStructures = async (partnerId) => {
    return await getAccounts((acs) => {
        return acs.filter((a) => a.partner_id === partnerId);
    });
};

const getAdministrator = async (adminId) => {
    return await getAccounts((acs) => {
        return acs.filter((a) => a.id === adminId);
    });
};

const getAdministrators = async () => {
    return await getAccounts((acs) => {
        return acs.filter((a) => a.is_admin === 1);
    });
};

const deleteAccount = async (account) => {
    const mailsToSend = [];
    try {
        if (account.is_partner) {
            const structures = await getPartnerStructures(account.id);

            await execute("DELETE FROM accounts WHERE partner_id = $partner_id", { $partner_id: account.id });

            structures.forEach((structure) => {
                mailsToSend.push({
                    templateFile: "account-deleted.html",
                    to: structure.email,
                    vars: { display_name: structure.name }
                });
            });
        }

        if (account.is_structure) {
            const partner = await getPartner(account.partner_id);

            if (partner.length >= 1)
                mailsToSend.push({
                    templateFile: "structure-account-deleted.html",
                    to: partner[0].email,
                    vars: { display_name: partner[0].name, structure_name: account.name }
                });
        }

        await execute("DELETE FROM accounts WHERE email = $email", { $email: account.email });

        mailsToSend.push({
            templateFile: "account-deleted.html",
            to: account.email,
            vars: { display_name: account.name }
        });
    } catch (error) {
        console.error(error);
        return false;
    }

    if (process.env.SEND_MAILS_ON_DELETE === "true") expressMultipleMail(mailsToSend);

    return true;
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

    try {
        await execute(`UPDATE accounts SET ${tokenType} = '' WHERE email = $email`, { $email: email });

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
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

const hasLeastOneAdmin = async () => {
    const rows = emptyOrRows(await query("SELECT * FROM accounts WHERE is_admin = 1", {}));

    if (rows.length < 2) return false;

    return true;
};

module.exports = {
    getAccount,
    getAccounts,
    getPartner,
    getPartners,
    getStructure,
    getPartnerStructures,
    getAdministrator,
    getAdministrators,
    deleteAccount,
    secureAccountData,
    generateToken,
    clearToken,
    refreshToken,
    hasLeastOneAdmin
};
