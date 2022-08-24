const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const ms = require("ms");

const { getGravatarUrl, expressMultipleMail, getHashedPassword, securePassword } = require("../../functions");
const { query, execute, emptyOrRows, getColumnNames } = require("../../services/db");

const { assignDefaultRights, deleteAccountRights, getAccountRights } = require("../rights/services");

/**
 * Securize account datas. Delete private datas of all accounts datas.
 * @param {Object} account Object contains account datas
 * @returns Object with securized account datas
 */
const formatAccountDatas = async (account) => {
    const { password, access_token, passwordlost_token, activation_token, avatar_url, ...lightAccount } = account;

    const rights = (await getAccountRights(account.id)).map((right) => {
        const { is_default, ...rest } = right;
        return { ...rest };
    });

    return { ...lightAccount, avatar_url: avatar_url ?? getGravatarUrl(account.email), rights };
};

/**
 * Remove no necessary datas from account datas for an admin account.
 * @param {Object} account Object contains account datas
 * @returns Object with admin account datas
 */
const toAdminAccountData = async (account) => {
    const { is_admin, postal_address, gsm, partner_id, ...rest } = await formatAccountDatas(account);

    return { ...rest };
};

/**
 * Remove no necessary datas from account datas for a partner account.
 * @param {Object} account Object contains account datas
 * @returns Object with partner account datas
 */
const toPartnerAccountData = async (account) => {
    const { is_admin, partner_id, ...rest } = await formatAccountDatas(account);

    return { ...rest };
};

/**
 * Remove no necessary datas from account datas for a structure account.
 * @param {Object} account Object contains account datas
 * @returns Object with structure account datas
 */
const toStructureAccountData = async (account) => {
    const { is_admin, ...rest } = await formatAccountDatas(account);

    return { ...rest };
};

/**
 * Add to account datas, properties, if it's an admin, partner or structure account and convert small integer to boolean
 * @param {Object} account Object contains account datas
 * @returns Clean account datas
 */
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

/**
 * Get an account from his email address.
 * @param {string} email Email address of the wanted account.
 * @param {CallableFunction} fn Optionnal. Callback function to add conditions. Account data in parameter of this callback function, and boolean return expected.
 * @param {boolean} onlyExists Optionnal. true, not monitoring account active state, else, false, return an error if account not yet activated.
 * @returns Object contains 2 properties, 'account', the complete account datas from database, and, 'error', contains 'code' and 'message' properties.
 */
const getAccount = async (email, fn = null, onlyExists = false) => {
    const rows = emptyOrRows(await query("SELECT * FROM accounts WHERE email = $email", { $email: email }));

    if (rows.length !== 1) return { account: null, error: { code: 404, message: "Account not found." } };

    const account = rows[0];

    if (!onlyExists) {
        if (!account.active) return { account: null, error: { code: 403, message: "Account is not yet activated." } };
    }

    if (fn && !fn(account)) return { account: null, error: { code: 403, message: "Unauthorized." } };

    return {
        account: cleanAccount(account),
        error: null
    };
};

/**
 * Get an account from his unique identifier.
 * @param {number} id Unique identifier of the wanted account.
 * @param {CallableFunction} fn Optionnal. Callback function to add conditions. Account data in parameter of this callback function, and boolean return expected.
 * @param {boolean} onlyExists Optionnal. true, not monitoring account active state, else, false, return an error if account not yet activated.
 * @returns Object contains 2 properties, 'account', the complete account datas from database, and, 'error', contains 'code' and 'message' properties.
 */
const getAccountFromId = async (id, fn = null, onlyExists = false) => {
    const rows = emptyOrRows(await query("SELECT * FROM accounts WHERE id = $id", { $id: id }));

    if (rows.length !== 1) return { account: null, error: { code: 404, message: "Account not found." } };

    const account = rows[0];

    if (!onlyExists) {
        if (!account.active) return { account: null, error: { code: 403, message: "Account is not yet activated." } };
    }

    if (fn && !fn(account)) return { account: null, error: { code: 403, message: "Unauthorized." } };

    return {
        account: cleanAccount(account),
        error: null
    };
};

/**
 * Get all accounts.
 * @param {CallableFunction} fn Optionnal. Callback function to add conditions. Array of accounts found in parameter of this callback function, return, array of filtered accounts expected.
 * @param {string} order Optionnal. Column name of SQL table 'accounts' to order by.
 * @param {string} direction Optionnal. 'ASC' or 'DESC', order direction.
 * @param {number} start Optionnal. Index of the first row to get. -1, to get all rows.
 * @returns Array of account datas found.
 */
const getAccounts = async (fn = null, order = "name", direction = "ASC", start = -1) => {
    availlableColumns = await getColumnNames("accounts");

    const n = availlableColumns.includes(order.trim()) ? order.trim() : "name";
    const d = direction.trim() === "ASC" ? direction.trim() : "DESC";
    const orderQuery = `ORDER BY ${n} ${d}`;

    const s = isNaN(parseInt(start)) ? -1 : parseInt(start);
    const l = process.env.ITEMS_PER_PAGE;
    const limitQuery = s > -1 ? `LIMIT ${l} OFFSET ${s}` : "";

    const rows = emptyOrRows(await query(`SELECT * FROM accounts ${orderQuery} ${limitQuery}`, {}));

    if (rows.length < 1) return [];

    let accounts = [...rows];
    if (fn) accounts = fn(accounts);

    accounts.map((account) => cleanAccount(account));

    return accounts;
};

/**
 * Get a partner account from his unique identifier.
 * @param {number} partnerId Unique identifier
 * @returns Array of account datas found.
 */
const getPartner = async (partnerId) => {
    return await getAccounts((acs) => {
        return acs.filter((a) => a.id === partnerId);
    });
};

/**
 * Get all partners.
 * @param {string} order Optionnal. Column name of SQL table 'accounts' to order by.
 * @param {string} direction Optionnal. 'ASC' or 'DESC', order direction.
 * @param {number} start Optionnal. Index of the first row to get. -1, to get all rows.
 * @returns Array of account datas found.
 */
const getPartners = async (order = "name", direction = "ASC", start = -1) => {
    return await getAccounts(
        (acs) => {
            return acs.filter((a) => a.is_admin === 0 && a.partner_id === 0);
        },
        order,
        direction,
        start
    );
};

/**
 * Get a structure account from his unique identifier.
 * @param {number} structureId Unique identifier
 * @returns Array of account datas found.
 */
const getStructure = async (structureId) => {
    return await getAccounts((acs) => {
        return acs.filter((a) => a.id === structureId);
    });
};

/**
 * Get all structures.
 * @param {number} partnerId Unique identifier of partner depends on.
 * @param {string} order Optionnal. Column name of SQL table 'accounts' to order by.
 * @param {string} direction Optionnal. 'ASC' or 'DESC', order direction.
 * @param {number} start Optionnal. Index of the first row to get. -1, to get all rows.
 * @returns Array of account datas found.
 */
const getPartnerStructures = async (partnerId, order = "name", direction = "ASC", start = -1) => {
    return await getAccounts(
        (acs) => {
            return acs.filter((a) => a.is_admin === 0 && a.partner_id === partnerId);
        },
        order,
        direction,
        start
    );
};

/**
 * Get an administrator account from his unique identifier.
 * @param {number} adminId Unique identifier
 * @returns Array of account datas found.
 */
const getAdministrator = async (adminId) => {
    return await getAccounts((acs) => {
        return acs.filter((a) => a.id === adminId);
    });
};

/**
 * Get all administrators.
 * @param {string} order Optionnal. Column name of SQL table 'accounts' to order by.
 * @param {string} direction Optionnal. 'ASC' or 'DESC', order direction.
 * @param {number} start Optionnal. Index of the first row to get. -1, to get all rows.
 * @returns Array of account datas found.
 */
const getAdministrators = async (order = "name", direction = "ASC", start = -1) => {
    return await getAccounts(
        (acs) => {
            return acs.filter((a) => a.is_admin === 1);
        },
        order,
        direction,
        start
    );
};

/**
 * Delete an account from database.
 * @param {Object} account Account datas to delete.
 * @returns true, no error returned, else, false.
 */
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

        if (!(await deleteAccountRights(account.id))) throw new Error("Unable to delete account rights.");

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

/**
 * Delete an account from his email address.
 * @param {string} email Email address of wanted account.
 * @returns true, if no error, else, false.
 */
const deleteAccountFromEmail = async (email) => {
    const { account, error } = await getAccount(email);
    if (account === null) return false;

    return await deleteAccount(account);
};

/**
 * Delete an account from his unique identifier.
 * @param {number} accountId Unique identifier of wanted account.
 * @returns true, if no error, else, false.
 */
const deleteAccountFromId = async (accountId) => {
    const { account, error } = await getAccountFromId(accountId);
    if (account === null) return false;

    return await deleteAccount(account);
};

/**
 * Generate, save and return an unique token with his JWT format.
 * @param {string} email Email of expected account.
 * @param {string} tokenType Type of token to store: "access_token", "activation_token", "passwordlost_token"
 * @returns An object contains, 'jwtToken': the JWT, 'expires': expiration date, and 'token': the unique token, content of the JWT
 */
const generateToken = async (email, tokenType = "access_token") => {
    const { account, error } = await getAccount(email);
    if (account === null) return { jwtToken: "", token: "", expires: 0 };

    const token = crypto.randomBytes(parseInt(process.env.TOKENS_LENGTH)).toString("hex");

    await execute(`UPDATE accounts SET ${tokenType} = $token WHERE email = $email`, {
        $email: email,
        $token: token
    });

    const jwtToken = jwt.sign({ email, token }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    const expires = new Date((Math.floor(Date.now() / 1000) + ms(process.env.JWT_EXPIRE) / 1000) * 1000);

    return { jwtToken, expires, token };
};

/**
 * Clear stored token in database.
 * @param {string} email Email of expected account.
 * @param {string} tokenType Type of token to store: "access_token", "activation_token", "passwordlost_token"
 * @returns true, if no error, else, false.
 */
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

/**
 * Refresh wanted JWT. Create new JWT with new expiration datetime and store it in database.
 * @param {string} jwtToken The JWT to refresh and store.
 * @param {string} tokenType Type of token to store: "access_token", "activation_token", "passwordlost_token"
 * @returns A promise, contains an object with 3 properties. 'account': the expected account datas, 'token': the new JWT, and, 'expires': the expiration datatime.
 */
const refreshToken = async (jwtToken, tokenType = "access_token") => {
    return new Promise(async (resolve, reject) => {
        jwt.verify(jwtToken, process.env.JWT_SECRET, async (err, credentials) => {
            if (err) reject(err);

            const { email, token, exp } = credentials;

            const { account, error } = await getAccount(email, (account) => account[tokenType] === token);
            if (account === null) return reject({ ...error, name: "Account" });

            const data = await generateToken(account.email, tokenType);

            resolve({ account: await formatAccountDatas(account), token: data.jwtToken, expires: data.expires });
        });
    });
};

/**
 * Get an account from a JWT token.
 * @param {string} jwtToken The token.
 * @returns A promise, contains an object with 3 properties. 'account': the expected account datas, 'token': the JWT, and, 'expires': the expiration datatime.
 */
const getAccountFromToken = async (jwtToken) => {
    return new Promise(async (resolve, reject) => {
        jwt.verify(jwtToken, process.env.JWT_SECRET, async (err, credentials) => {
            if (err) reject(err);

            const { email, token, exp } = credentials;

            const { account, error } = await getAccount(email, (account) => account["access_token"] === token);
            if (account === null) return reject({ ...error, name: "Account" });

            resolve({ account: await formatAccountDatas(account), token: jwtToken, expires: exp });
        });
    });
};

/**
 * Return if database contains the last one admin account.
 * @returns true, more then on admin account found, else, false.
 */
const hasLeastOneAdmin = async () => {
    const rows = emptyOrRows(await query("SELECT * FROM accounts WHERE is_admin = 1", {}));

    if (rows.length < 2) return false;

    return true;
};

/**
 * Update the password of an account.
 * @param {string} email Email address of the account.
 * @param {string} password New password to store.
 * @returns true, if no error, else, false.
 */
const changePassword = async (email, password) => {
    const { account, error } = await getAccount(email);
    if (account === null) return false;

    try {
        await execute(
            "UPDATE accounts SET passwordlost_token = '', first_connexion = 0, password = $password WHERE email = $email",
            {
                $email: email,
                $password: getHashedPassword(password)
            }
        );

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

/**
 * Return if an account exists.
 * @param {string} email Email address of the account.
 * @returns true, an account found, else, false.
 */
const accountExists = async (email) => {
    const { account, error } = await getAccount(email, null, true);

    return !(account === null);
};

/**
 * Return if an account name exists.
 * @param {string} email Name of the account.
 * @returns true, an account found, else, false.
 */
const nameExists = async (name) => {
    const rows = emptyOrRows(await query("SELECT * FROM accounts WHERE name LIKE $name", { $name: name }));
    if (rows.length < 1) return false;

    return true;
};

/**
 * Create and save new account.
 * @param {*} email Unique email address.
 * @param {*} name Unique account name.
 * @param {*} isAdmin Optionnal. true, it's an admin account, else, false.
 * @param {*} partnerId Optionnal. If it's a structure account, set the partner unique identifier, else set to 0.
 * @param {*} postalAddress Optionnal. A postal address.
 * @param {*} gsm Optionnal. A phone number.
 * @param {*} avatarUrl Optionnal. An image url for avatar. If set to null, or no set, Gravatar url is used.
 * @returns true, account created, else, false on error.
 */
const createAccount = async (
    email,
    name,
    isAdmin = false,
    partnerId = 0,
    postalAddress = "",
    gsm = "",
    avatarUrl = null
) => {
    const mailsToSend = [];

    try {
        const tempPassword = securePassword.generate(16);
        const token = crypto.randomBytes(process.env.TOKENS_LENGTH).toString("hex");

        const emailAddress = email.trim();

        const result = await execute(
            "INSERT INTO accounts (email, password, name, is_admin, partner_id, postal_address, gsm, avatar_url, active, first_connexion, activation_token) VALUES ($email, $password, $name, $is_admin, $partner_id, $postal_address, $gsm, $avatar_url, 0, 1, $activation_token)",
            {
                $email: emailAddress,
                $password: getHashedPassword(tempPassword),
                $name: name.trim(),
                $is_admin: isAdmin ? 1 : 0,
                $partner_id: partnerId,
                $postal_address: postalAddress.trim(),
                $gsm: gsm.trim(),
                $avatar_url: avatarUrl.trim() === "" ? null : avatarUrl.trim(),
                $activation_token: token
            }
        );

        if (!isAdmin) {
            if (!(await assignDefaultRights(result.lastID))) {
                await deleteAccountFromId(result.lastID);

                return false;
            }
        }

        mailsToSend.push({
            templateFile: "activation-link.html",
            to: emailAddress,
            vars: {
                display_name: name,
                email: emailAddress,
                temp_password: tempPassword,
                link: `${process.env.FRONTEND_ACTIVATION_LINK}?token=${token}`
            }
        });

        if (partnerId > 0) {
            const partners = await getPartner(partnerId);
            if (partners.length > 0) {
                mailsToSend.push({
                    templateFile: "structure-account-created.html",
                    to: partners[0].email,
                    vars: {
                        display_name: partners[0].name,
                        structure_name: name
                    }
                });
            }
        }
    } catch (error) {
        console.error(error);
        return false;
    }

    expressMultipleMail(mailsToSend);

    return true;
};

/**
 * Change the active state of an account.
 * @param {string} email Email address of the account.
 * @param {boolean} active Optionna. New state of the active state.
 * @returns true, if no error, else, false.
 */
const activate = async (email, active = false) => {
    const mailsToSend = [];

    try {
        const { account, error } = await getAccount(email, null, true);
        if (account === null) return false;

        await execute("UPDATE accounts SET active = $active, activation_token = '' WHERE email = $email", {
            $active: active === true ? 1 : 0,
            $email: email
        });

        mailsToSend.push({
            templateFile: "activation-state-changed.html",
            to: email,
            vars: {
                display_name: account.name,
                active_state: active === true ? "checked" : ""
            }
        });

        if (account.partner_id > 0) {
            const partners = await getPartner(account.partner_id);
            if (partners.length > 0) {
                mailsToSend.push({
                    templateFile: "structure-activation-state-changed.html",
                    to: partners[0].email,
                    vars: {
                        display_name: partners[0].name,
                        structure_name: account.name,
                        structure_active_state: active === true ? "checked" : ""
                    }
                });
            }
        }
    } catch (error) {
        console.error(error);
        return false;
    }

    if (process.env.SEND_MAILS_ON_ACTIVATION_CHANGE === "true") expressMultipleMail(mailsToSend);

    return true;
};

/**
 * Update an account.
 * @param {Object} currentAuthAccount Account datas of the current authentified user.
 * @param {Object} account Account datas to update.
 * @param {Object} body Datas to update with new values. eg: { name: "bob", "gsm": '0102030405", "postal_address": "" }.
 * @returns true, data updated successfully, else false on error.
 */
const updateAccount = async (currentAuthAccount, account, body) => {
    const mailsToSend = [];

    try {
        const columns = await getColumnNames("accounts");

        const {
            access_token,
            passwordlost_token,
            activation_token,
            active,
            password,
            first_connexion,
            is_admin,
            ...bodyParams
        } = body;

        let params = {};
        for (let key of Object.keys(bodyParams)) {
            if (columns.includes(key)) params = { ...params, [key]: bodyParams[key] };
        }

        if ("email" in params) {
            if (currentAuthAccount.email === account.email) {
                const { email, ...rest } = params;
                params = { ...rest };
            } else {
                const token = crypto.randomBytes(process.env.TOKENS_LENGTH).toString("hex");

                params = { ...params, access_token: "", passwordlost_token: "", activation_token: token, active: 0 };

                mailsToSend.push({
                    templateFile: "re-activation-link.html",
                    to: params.email,
                    vars: {
                        display_name: params.name,
                        email: params.email,
                        link: `${process.env.FRONTEND_ACTIVATION_LINK}?token=${token}`
                    }
                });
            }
        }

        if ("partner_id" in params) {
            let err = true;

            if (account.is_structure) {
                const pid = parseInt(params.partner_id);
                if (!isNaN(pid)) {
                    const oldPartners = await getPartner(account.partner_id);
                    if (oldPartners.length >= 1) {
                        const oldPartner = oldPartners[0];

                        mailsToSend.push({
                            templateFile: "structure-account-deleted.html",
                            to: oldPartner.email,
                            vars: { display_name: oldPartner.name, structure_name: account.name }
                        });
                    }

                    if (pid > 0) {
                        const newPartners = await getPartner(pid);
                        err = newPartners.length < 1;
                        if (!err) {
                            const newPartner = newPartners[0];

                            mailsToSend.push({
                                templateFile: "structure-account-created.html",
                                to: newPartner.email,
                                vars: {
                                    display_name: newPartner.name,
                                    structure_name: account.name
                                }
                            });
                        }
                    } else {
                        mailsToSend.push({
                            templateFile: "new-partner.html",
                            to: account.email,
                            vars: {
                                display_name: account.name
                            }
                        });
                    }
                }
            }

            if (err) {
                const { partner_id, ...rest } = params;
                params = { ...rest };
            }
        }

        const queryParams = [];
        let vars = { $id: account.id };
        for (let key of Object.keys(params)) {
            queryParams.push(`${key} = $${key}`);
            vars = { ...vars, [`$${key}`]: params[key] };
        }

        await execute(`UPDATE accounts SET ${queryParams.join(", ")} WHERE id = $id`, vars);
    } catch (error) {
        console.error(error);
        return false;
    }

    if (process.env.SEND_MAILS_ON_UPDATE === "true") expressMultipleMail(mailsToSend);

    return true;
};

module.exports = {
    getAccount,
    getAccountFromId,
    getAccounts,
    getPartner,
    getPartners,
    getStructure,
    getPartnerStructures,
    getAdministrator,
    getAdministrators,
    deleteAccount,
    deleteAccountFromEmail,
    deleteAccountFromId,
    formatAccountDatas,
    generateToken,
    clearToken,
    refreshToken,
    hasLeastOneAdmin,
    changePassword,
    createAccount,
    accountExists,
    nameExists,
    activate,
    toAdminAccountData,
    toPartnerAccountData,
    toStructureAccountData,
    updateAccount,
    getAccountFromToken
};
