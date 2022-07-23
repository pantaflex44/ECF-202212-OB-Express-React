const { Router, response, request } = require("express");

const { getHashedPassword } = require("../../functions");
const { generateToken, clearToken, secureAccountData, getAccount } = require("./services");

const router = Router();

router.post("/login", async (req, res = response) => {
    const { email, password } = req.body;

    const { account, error } = await getAccount(email, (account) => account.password === getHashedPassword(password));
    if (account === null) return res.status(error.code).json({ message: error.message });

    const data = await generateToken(account.email, "access_token");
    if (data.jwtToken === "") return res.sendStatus(500);

    if (!(await clearToken(email, "passwordlost_token"))) return res.sendStatus(500);

    return res.json({ account: secureAccountData(account), token: data.jwtToken, expires: data.expires });
});

module.exports = router;
