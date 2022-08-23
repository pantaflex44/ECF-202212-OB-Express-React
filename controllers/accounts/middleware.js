const jwt = require("jsonwebtoken");

const { formatAccountDatas, getAccount } = require("./services");

/**
 * ExpressJs Middleware.
 * Authenticate visitor from the Authorization header and the passed Baerer token.
 * Add the user account in the HTTP request object, under 'auth' property.
 * This new property contains 'account', the account datas, 'token', the JWT found, and 'expires', the expiration datatime.
 * @param {Object} req ExpressJs HTTP request object.
 * @param {Object} res ExpressJs HTTP response obecjt.
 * @param {Function} next ExpressJs to call next middleware.
 * @returns The HTTP response.
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const jwtToken = authHeader.split(" ")[1];

        jwt.verify(jwtToken, process.env.JWT_SECRET, async (err, credentials) => {
            if (err) {
                if (err.name === "TokenExpiredError") return res.status(401).json({ message: "Session expired." });

                return res.status(403).json({ message: "Bad credentials." });
            }

            const { email, token, exp } = credentials;

            const { account, error } = await getAccount(email, (account) => account.access_token === token);
            if (account === null) return res.status(error.code).json({ message: error.message });

            req.auth = {
                account: await formatAccountDatas(account),
                token: jwtToken,
                expires: new Date((exp || Date.now() / 1000) * 1000).toISOString()
            };

            next();
        });
    } else {
        return res.status(403).json({ message: "Unauthorized." });
    }
};

module.exports = { authenticate };
