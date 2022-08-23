"use strict";

const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

if (process.env.NODE_ENV === "development") console.warn("\x1b[33m%s\x1b[0m", "API start in developement mode!\n");

let envFile = `./.env.${process.env.NODE_ENV}`;
try {
    if (!fs.existsSync(envFile)) {
        console.log(`Dotenv ${envFile} not found. .env used.`);
        envFile = "./.env";
    }
} catch {
    console.error(`Unable to know if ${envFile} exists. .env used.`);
    envFile = "./.env";
}
require("dotenv").config({ path: envFile });
console.log(`Dotenv ${envFile} loaded.\n`);

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

app.use("/api/accounts", require("./controllers/accounts"));

const port = process.env.PORT || 3001;

//if (process.env.NODE_ENV === "development") {
console.warn("\x1b[33m%s\x1b[0m", "Local HTTPS protocol used only in development mode...");

const privateKey = fs.readFileSync(process.env.SSL_KEY, "utf8");
const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE, "utf8");
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
    console.log("\x1b[36m%s\x1b[0m", `API server started and listening on https://localhost:${port}`);
});
//} else {
//app.listen(port, () => console.log("\x1b[36m%s\x1b[0m", `API server started and listening on port ${port}`));
//}
