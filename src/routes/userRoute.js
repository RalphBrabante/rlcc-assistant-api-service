// routes/index.js
const express = require("express");
const router = express.Router();
const createUser = require("../controllers/user/createUser");
const getUser = require("../controllers/user/getUser");
const getAllActiveUsers = require("../controllers/user/getAllActiveUsers");
const countAllActiveUsers = require("../controllers/user/countAllActiveUsers");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");



router.get(
  "/count",
  authenticate,
  authorize(["read_all_users"]),
  countAllActiveUsers.validate,
  countAllActiveUsers.invoke
);

router.get(
  "",
  authenticate,
  authorize(["read_all_users"]),
  getAllActiveUsers.validate,
  getAllActiveUsers.invoke
);


router.post(
  "",
  authenticate,
  authorize(["create_user"]),
  createUser.validate,
  createUser.invoke
);


router.get(
  "/:id",
  authenticate,
  authorize(["get_user"]),
  getUser.validate,
  getUser.invoke
);


module.exports = router;
