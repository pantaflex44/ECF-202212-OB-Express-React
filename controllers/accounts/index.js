const { Router, response, request } = require("express");

const { authentificate } = require("./middleware");
const { getHashedPassword } = require("../../functions");
const {
    generateToken,
    clearToken,
    secureAccountData,
    getAccount,
    hasLeastOneAdmin,
    deleteAccount
} = require("./services");

const router = Router();

router.delete("/", authentificate, async (req, res = response) => {
    const { email } = req.body;

    const { account, error } = await getAccount(email, null, true);
    if (account === null) return res.status(error.code).json({ message: error.message });

    if (account.is_admin) {
        const oneOrMoreAdmin = await hasLeastOneAdmin();
        if (!oneOrMoreAdmin)
            return res.status(403).json({
                message: "One or more administrator account must be registered. Unable to delete the last one."
            });
    }

    const deleted = await deleteAccount(account.email);
    if (!deleted) return res.status(404).json({ message: "Unable to delete this account." });

    return res.sendStatus(202);
});

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

module.exports = router;
