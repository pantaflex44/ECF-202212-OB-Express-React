const { Router, response } = require("express");

const { authenticate } = require("./middleware");
const { getHashedPassword } = require("../../functions");
const {
    generateToken,
    clearToken,
    secureAccountData,
    getAccount,
    hasLeastOneAdmin,
    deleteAccount,
    refreshToken
} = require("./services");

const router = Router();

// Deleting an account. If it is a partner account, deletion of all dependent structures.
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
    if (!deleted) return res.status(404).json({ message: "Unable to delete this account." });

    return res.sendStatus(202);
});

// Login to the app to obtain a Json Web Token.
router.post("/login", async (req, res = response) => {
    const { email, password } = req.body;

    const { account, error } = await getAccount(email, (account) => account.password === getHashedPassword(password));
    if (account === null) return res.status(error.code).json({ message: error.message });

    const data = await generateToken(account.email, "access_token");
    if (data.jwtToken === "") return res.sendStatus(500);

    const cleared = await clearToken(email, "passwordlost_token");
    if (!cleared) return res.sendStatus(500);

    return res.json({ account: secureAccountData(account), token: data.jwtToken, expires: data.expires });
});

// Self logout to the application.
router.get("/logout", authenticate, async (req, res = response) => {
    const currentAuthAccount = req.auth.account;

    const cleared = await clearToken(currentAuthAccount.email, "access_token");
    if (!cleared) return res.sendStatus(500);

    return res.sendStatus(204);
});

// Logout an account by his email to the application.
router.post("/logout", authenticate, async (req, res = response) => {
    const { email } = req.body;

    const currentAuthAccount = req.auth.account;
    if (currentAuthAccount.is_admin) {
        const { account, error } = await getAccount(email);
        if (account === null) return res.status(error.code).json({ message: error.message });

        const cleared = await clearToken(account.email, "access_token");
        if (!cleared) return res.sendStatus(500);

        return res.sendStatus(204);
    }

    return res.status(403).json({ message: "Account not allowed." });
});

// Refresh JWT token before expiration.
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

module.exports = router;
