// routes/index.js
const express = require("express");
const router = express.Router();
const createUser = require("../controllers/user/createUser");
const getUser = require("../controllers/user/getUser");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

router.get(
  "/:id",
  authenticate,
  authorize(["read_user"]),
  getUser.validate,
  getUser.invoke
);

router.post(
  "",
  authenticate,
  authorize(["create_user"]),
  createUser.validate,
  createUser.invoke
);

module.exports = router;
