// routes/index.js
const express = require("express");
const router = express.Router();

const getServerStatus = require("../controllers/configuration/getServerStatus");

const authenticate = require("../middlewares/authenticate");

const authorize = require("../middlewares/authorize");

router.get("", authenticate, getServerStatus.validate, getServerStatus.invoke);

module.exports = router;
