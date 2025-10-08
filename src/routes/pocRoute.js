// routes/index.js
const express = require("express");
const router = express.Router();
const migrateUsers = require("../controllers/pco/migrateUsers");
const authenticate = require("../middlewares/authenticate");

router.post("/migrateUsers", authenticate, migrateUsers.validate, migrateUsers.invoke);

module.exports = router;
