const { Router, response } = require("express");

const { authenticate } = require("../accounts/middleware");

const router = Router();

module.exports = router;
