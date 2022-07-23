const jwt = require("jsonwebtoken");

const { secureAccountData, getAccount } = require("./services");

const authentificate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, async (err, credentials) => {
            if (err) {
                if (err.name === "TokenExpiredError") return res.status(401).json({ message: "Session expired." });

                return res.status(403).json({ message: "Bad credentials." });
            }

            const { email, token, exp } = credentials;

            const { account, error } = await getAccount(email, (account) => account.access_token === token);
            if (account === null) return res.status(error.code).json({ message: error.message });

            req.auth = {
                account: secureAccountData(account),
                expires: new Date((exp || Date.now() / 1000) * 1000).toISOString()
            };

            next();
        });
    } else {
        return res.status(401).json({ message: "Unauthorized." });
    }
};

module.exports = { authentificate };
