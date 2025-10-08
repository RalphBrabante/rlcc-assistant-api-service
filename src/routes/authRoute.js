// routes/index.js
const express = require("express");
const router = express.Router();
const authenticate = require("../controllers/auth/authenticate");
const verifyToken = require("../controllers/auth/verifyToken");
const logout = require("../controllers/auth/logout");
const authentication = require("../middlewares/authenticate");

router.post("", authenticate.validate, authenticate.invoke);
router.post("/verifyToken", verifyToken.validate, verifyToken.invoke);
router.delete("", authentication, logout.validate, logout.invoke);

module.exports = router;
