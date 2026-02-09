// routes/index.js
const express = require("express");
const router = express.Router();
const authenticate = require("../controllers/auth/authenticate");
const verifyToken = require("../controllers/auth/verifyToken");
const logout = require("../controllers/auth/logout");
const forgotPassword = require("../controllers/auth/forgotPassword");
const resetPassword = require("../controllers/auth/resetPassword");
const authentication = require("../middlewares/authenticate");
const loginRateLimit = require("../middlewares/loginRateLimit");

router.post("", loginRateLimit, authenticate.validate, authenticate.invoke);
router.post("/verifyToken", verifyToken.validate, verifyToken.invoke);
router.post("/forgot-password", loginRateLimit, forgotPassword.validate, forgotPassword.invoke);
router.post("/reset-password", loginRateLimit, resetPassword.validate, resetPassword.invoke);
router.delete("", authentication, logout.validate, logout.invoke);

module.exports = router;
