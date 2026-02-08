// routes/index.js
const express = require("express");
const router = express.Router();
const migrateUsers = require("../controllers/pco/migrateUsers");
const authenticate = require("../middlewares/authenticate");
const requireSuperUser = require("../middlewares/requireSuperUser");

router.post(
  "/migrateUsers",
  authenticate,
  requireSuperUser,
  migrateUsers.validate,
  migrateUsers.invoke
);
router.post(
  "/migrateAllUsers",
  authenticate,
  requireSuperUser,
  migrateUsers.validate,
  migrateUsers.invokeAll
);
router.get(
  "/previewUsers",
  authenticate,
  requireSuperUser,
  migrateUsers.validate,
  migrateUsers.preview
);
router.get(
  "/previewAllUsers",
  authenticate,
  requireSuperUser,
  migrateUsers.validate,
  migrateUsers.previewAll
);

module.exports = router;
