// routes/index.js
const express = require("express");
const router = express.Router();
const authenticate = require("../controllers/auth/authenticate");
const verifyToken = require("../controllers/auth/verifyToken");

router.post("", authenticate.validate, authenticate.invoke);
router.post("/verifyToken", verifyToken.validate, verifyToken.invoke);

module.exports = router;
