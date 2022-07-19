"use strict";

var fs = require("fs");
var https = require("https");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

require("dotenv").config({ path: `./.env.${process.env.NODE_ENV}` });

var privateKey = fs.readFileSync("./certs/server.key", "utf8");
var certificate = fs.readFileSync("./certs/server.crt", "utf8");
var credentials = { key: privateKey, cert: certificate };

const app = express();

app.use(
    rateLimit({
        windowMs: process.env.RATE_LIMIT_DELAY,
        max: process.env.RATE_LIMIT_COUNTER,
        standardHeaders: true,
        legacyHeaders: false
    })
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/*app.use("/api", require("./controllers/defaults"));
app.use("/api/auth", require("./controllers/auth"));
app.use("/api/story", require("./controllers/story"));*/

const port = process.env.PORT || 3001;

if (process.env.USE_LOCAL_HTTPS) {
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(port, () => {
        console.log(`Server starting and listening on port ${port}`);
    });
} else {
    app.listen(port, () => console.log(`Server starting and listening on port ${port}`));
}
