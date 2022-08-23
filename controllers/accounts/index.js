const { Router, response } = require("express");

const { authenticate } = require("./middleware");
const {
    getHashedPassword,
    expressMail,
    validatePassword,
    securePassword,
    validateEmail,
    validateName,
    verifyHashedPassword
} = require("../../functions");
const {
    generateToken,
    clearToken,
    formatAccountDatas,
    getAccount,
    hasLeastOneAdmin,
    deleteAccount,
    refreshToken,
    changePassword,
    accountExists,
    nameExists,
    createAccount,
    getPartner,
    activate,
    getAdministrators,
    getPartners,
    getPartnerStructures,
    toAdminAccountData,
    toPartnerAccountData,
    toStructureAccountData,
    getAccountFromId,
    updateAccount,
    getAccountFromToken
} = require("./services");

const router = Router();

/**
 * DEL /api/accounts/
 * Delete an account by his email address.
 */
router.delete("/", authenticate, async (req, res = response) => {
    const { email } = req.body;

    const currentAuthAccount = req.auth.account;
    if (
        currentAuthAccount.is_structure ||
        (currentAuthAccount.is_partner && process.env.PARTNERS_CAN_DELETE_STRUCTS !== "true")
    )
        return res
            .status(403)
            .json({ message: "Only administrators and authorized partners are able to delete accounts." });

    const { account, error } = await getAccount(email, null, true);
    if (account === null) return res.status(error.code).json({ message: error.message });

    if (currentAuthAccount.is_partner) {
        if (!account.is_structure || currentAuthAccount.id !== account.partner_id)
            return res.status(403).json({ message: "Partners are only allowed to delete their structures." });
    }

    if (account.is_admin) {
        const oneOrMoreAdmin = await hasLeastOneAdmin();
        if (!oneOrMoreAdmin)
            return res.status(403).json({
                message: "One or more administrator account must be registered. Unable to delete the last one."
            });
    }

    const deleted = await deleteAccount(account);
    if (!deleted) return res.status(500).json({ message: "Unable to delete this account." });

    return res.sendStatus(202);
});

/**
 * POST /api/accounts/
 * Create an account from type.
 */
router.post("/", authenticate, async (req, res = response) => {
    const currentAuthAccount = req.auth.account;
    if (currentAuthAccount.is_admin) {
        const { type, name, email } = req.body;
        if (!["admin", "partner", "structure"].includes(type))
            return res.status(400).json({ message: "Bad account type." });

        const isAdmin = type === "admin" ? 1 : 0;
        const partnerId = type === "structure" ? parseInt(req.body.partner_id) : 0;
        if (type === "structure" && partnerId < 1)
            return res.status(400).json({ message: "Structure has wrong partner." });
        if (type === "structure" && partnerId > 0) {
            const partners = await getPartner(partnerId);
            if (partners.length < 1) return res.status(400).json({ message: "Unknown partner." });
        }

        const postalAddress = (req.body.postal_address || "").trim();
        const gsm = (req.body.gsm || "").trim();
        const avatarUrl = req.body.avatar_url || "";

        if (!validateEmail(email)) return res.status(400).json({ message: "Bad email format." });
        if (!validateName(name)) return res.status(400).json({ message: "Bad name format." });

        if (await accountExists(email))
            return res.status(400).json({ message: "Account already exists with this email." });

        if (await nameExists(name))
            return res.status(400).json({ message: "Display name already used for another account." });

        const created = await createAccount(email, name, isAdmin, partnerId, postalAddress, gsm, avatarUrl);
        if (!created) return res.status(500).json({ message: "Unable to create this account." });

        return res.sendStatus(201);
    }

    return res.status(403).json({ message: "Account not allowed." });
});

/**
 * PUT /api/accounts/
 * Update an account.
 */
router.put("/", authenticate, async (req, res = response) => {
    const currentAuthAccount = req.auth.account;
    if (currentAuthAccount.is_admin) {
        const { account_id, ...body } = req.body;

        const { account, error } = await getAccountFromId(accountId, null, true);
        if (account === null) return res.status(error.code).json({ message: error.message });

        const updated = await updateAccount(currentAuthAccount, account, body);
        if (!updated) return res.status(500).json({ message: "Unable to update this account." });

        return res.sendStatus(204);
    }

    return res.status(403).json({ message: "Account not allowed." });
});

/**
 * GET /api/accounts/:page?
 * Get the accounts list. Add page number (:page?) to the end of path. No page in path, set the first page to return.
 */
router.get("/:page?", authenticate, async (req, res = response) => {
    const page = req.params.page || 1;
    let start = page * process.env.ITEMS_PER_PAGE - process.env.ITEMS_PER_PAGE;

    const previousPage = page > 1 ? page - 1 : page;
    const ret = {
        previousPage,
        page,
        itemsPerPage: process.env.ITEMS_PER_PAGE
    };

    const currentAuthAccount = req.auth.account;

    if (currentAuthAccount.is_admin) {
        let admins = (await getAdministrators("active", "ASC", start)).map(
            async (account) => await toAdminAccountData(account)
        );
        const adminsHasNextPage = admins.length >= process.env.ITEMS_PER_PAGE;

        const partners = (await getPartners("active", "ASC", start)).map(
            async (account) => await toPartnerAccountData(account)
        );
        const partnersWithStructures = [];
        for (let partner of partners) {
            const structures = (await getPartnerStructures(partner.id)).map(
                async (account) => await toStructureAccountData(account)
            );
            partnersWithStructures.push({ ...partner, structures });
        }

        const partnersHasNextPage = partnersWithStructures.length >= process.env.ITEMS_PER_PAGE;

        return res.status(200).json({
            ...ret,
            nextPage: adminsHasNextPage || partnersHasNextPage ? page + 1 : page,
            accounts: {
                admins,
                partners: partnersWithStructures
            }
        });
    }

    if (currentAuthAccount.is_partner) {
        const structures = (await getPartnerStructures(currentAuthAccount.id, "active", "ASC", start)).map((account) =>
            toStructureAccountData(account)
        );
        const structuresHasNextPage = structures.length >= process.env.ITEMS_PER_PAGE;

        return res.status(200).json({
            ...ret,
            nextPage: structuresHasNextPage ? page + 1 : page,
            accounts: {
                structures
            }
        });
    }

    return res.status(200).json({
        ...ret,
        nextPage: page,
        accounts: {}
    });
});

/**
 * POST /api/accounts/selfactivation/
 * Activate owner account.
 */
router.post("/selfactivation", async (req, res = response) => {
    const { email, token } = req.body;

    const { account, error } = await getAccount(email, null, true);
    if (account === null) return res.status(error.code).json({ message: error.message });

    if (token !== account.activation_token) return res.status(403).json({ message: "Bad security token." });

    if (!(await activate(email, true))) return res.sendStatus(500);

    res.sendStatus(204);
});

/**
 * POST /api/accounts/activate/
 * Activate an account.
 */
router.post("/activate", authenticate, async (req, res = response) => {
    const currentAuthAccount = req.auth.account;
    if (currentAuthAccount.is_admin) {
        const { email, active } = req.body;

        if (email === currentAuthAccount.email)
            return res.status(400).json({ message: "Unable to change your account activation state." });

        const { account, error } = await getAccount(email, null, true);
        if (account === null) return res.status(error.code).json({ message: error.message });

        let activationState = parseInt(active);
        if (activationState !== 1) activationState = 0;

        if (!(await activate(email, activationState === 1))) return res.sendStatus(500);

        return res.sendStatus(204);
    }

    return res.status(403).json({ message: "Account not allowed." });
});

/**
 * POST /api/accounts/login/
 * Login to an account.
 */
router.post("/login", async (req, res = response) => {
    const { email, password } = req.body;

    const { account, error } = await getAccount(email, (account) => verifyHashedPassword(password, account.password));
    if (account === null) return res.status(error.code).json({ message: error.message });

    const data = await generateToken(account.email, "access_token");
    if (data.jwtToken === "") return res.sendStatus(500);

    const cleared = await clearToken(email, "passwordlost_token");
    if (!cleared) return res.sendStatus(500);

    return res.json({ account: await formatAccountDatas(account), token: data.jwtToken, expires: data.expires });
});

/**
 * GET /api/accounts/logout/
 * Logout of owner account.
 */
router.get("/logout", authenticate, async (req, res = response) => {
    const currentAuthAccount = req.auth.account;

    const cleared = await clearToken(currentAuthAccount.email, "access_token");
    if (!cleared) return res.sendStatus(500);

    return res.sendStatus(204);
});

/**
 * POST /api/accounts/logout/
 * Logout of an account.
 */
router.post("/logout", authenticate, async (req, res = response) => {
    const currentAuthAccount = req.auth.account;
    if (currentAuthAccount.is_admin) {
        const { email } = req.body;

        const { account, error } = await getAccount(email);
        if (account === null) return res.status(error.code).json({ message: error.message });

        const cleared = await clearToken(account.email, "access_token");
        if (!cleared) return res.sendStatus(500);

        return res.sendStatus(204);
    }

    return res.status(403).json({ message: "Account not allowed." });
});

/**
 * POST /api/accounts/refresh/
 * Refresh a JWT.
 */
router.post("/refresh", authenticate, async (req, res = response) => {
    const { token } = req.auth;

    refreshToken(token, "access_token")
        .then((credentials) => {
            return res.json(credentials);
        })
        .catch((error) => {
            if (error.name === "Account") return res.status(error.code).json({ message: error.message });
            return res.status(403).json({ message: "Account not allowed." });
        });
});

/**
 * POST /api/accounts/passwordlost/
 * Send mail to user to set new password after password lost.
 */
router.post("/passwordlost", async (req, res = response) => {
    const { email } = req.body;

    const { account, error } = await getAccount(email);
    if (account === null) return res.status(error.code).json({ message: error.message });

    const { token } = await generateToken(email, "passwordlost_token");

    expressMail("newpassword-link.html", account.email, {
        display_name: account.name,
        email: account.email,
        link: `${process.env.FRONTEND_NEWPASSWORD_LINK}?token=${token}`
    })
        .then(async (info) => {
            const cleared = await clearToken(account.email, "access_token");
            if (!cleared) return res.sendStatus(500);

            return res.sendStatus(204);
        })
        .catch((error) => {
            return res.status(error.code).json({ message: error.message });
        });
});

/**
 * POST /api/accounts/newpassword/
 * Define new password after password lost process.
 */
router.post("/newpassword", async (req, res = response) => {
    const { email, token, password } = req.body;

    const { account, error } = await getAccount(email);
    if (account === null) return res.status(error.code).json({ message: error.message });

    if (token !== account.passwordlost_token) return res.status(403).json({ message: "Bad security token." });

    const validated = validatePassword(password);
    if (!validated) return res.status(400).json({ message: "Bad password format." });

    if (!(await changePassword(account.email, password))) return res.sendStatus(500);
    if (!(await clearToken(account.email, "access_token"))) return res.sendStatus(500);

    res.sendStatus(204);
});

/**
 * POST /api/accounts/changepassword/
 * Define new password.
 */
router.post("/changepassword", authenticate, async (req, res = response) => {
    const { email, password } = req.body;

    const { account, error } = await getAccount(email);
    if (account === null) return res.status(error.code).json({ message: error.message });

    const currentAuthAccount = req.auth.account;
    if (currentAuthAccount.email === account.email || currentAuthAccount.is_admin) {
        const validated = validatePassword(password);
        if (!validated) return res.status(400).json({ message: "Bad password format." });

        if (!(await changePassword(account.email, password))) return res.sendStatus(500);
        if (!(await clearToken(account.email, "access_token"))) return res.sendStatus(500);

        return res.sendStatus(204);
    }

    return res.status(403).json({ message: "Account not allowed." });
});

/**
 * POST /api/accounts/resetpassword/
 * Reset a password, save to the wanted account, and return the securized new password.
 */
router.post("/resetpassword", authenticate, async (req, res = response) => {
    const { email } = req.body;

    const { account, error } = await getAccount(email);
    if (account === null) return res.status(error.code).json({ message: error.message });

    const currentAuthAccount = req.auth.account;
    if (currentAuthAccount.is_admin) {
        const newPassword = securePassword.generate(16);

        if (!(await changePassword(account.email, newPassword))) return res.sendStatus(500);
        if (!(await clearToken(account.email, "access_token"))) return res.sendStatus(500);

        return res.status(200).json({ email: account.email, password: newPassword });
    }

    return res.status(403).json({ message: "Account not allowed." });
});

/**
 * POST /api/accounts/emailexists/
 * Return true if an email account exists, else, return false
 */
router.post("/emailexists", async (req, res = response) => {
    const { email } = req.body;

    const { account, error } = await getAccount(email);
    return res.status(200).json({ exists: account !== null });
});

/**
 * POST /api/accounts/nameexists/
 * Return true if a user name exists, else, return false
 */
router.post("/nameexists", authenticate, async (req, res = response) => {
    const currentAuthAccount = req.auth.account;
    if (currentAuthAccount.is_admin) {
        const { name } = req.body;

        const exists = await nameExists(name);
        return res.status(200).json({ exists });
    }

    return res.status(403).json({ message: "Account not allowed." });
});

module.exports = router;
