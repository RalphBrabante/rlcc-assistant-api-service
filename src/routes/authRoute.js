// routes/index.js
const express = require("express");
const router = express.Router();
const authenticate = require("../controllers/auth/authenticate");
const verifyToken = require("../controllers/auth/verifyToken");
const logout = require("../controllers/auth/logout");
const authentication = require("../middlewares/authenticate");
const loginRateLimit = require("../middlewares/loginRateLimit");

router.post("", loginRateLimit, authenticate.validate, authenticate.invoke);
router.post("/verifyToken", verifyToken.validate, verifyToken.invoke);
router.delete("", authentication, logout.validate, logout.invoke);

module.exports = router;
