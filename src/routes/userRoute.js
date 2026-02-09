// routes/index.js
const express = require("express");
const router = express.Router();
const createUser = require("../controllers/user/createUser");
const getUser = require("../controllers/user/getUser");
const getAllActiveUsers = require("../controllers/user/getAllActiveUsers");
const updateUser = require("../controllers/user/updateUser");
const countAllActiveUsers = require("../controllers/user/countAllActiveUsers");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const initUserResource = require("../middlewares/initUserResource");
const { cacheRead, invalidateCache } = require("../middlewares/cacheMiddleware");

router.get(
  "/count",
  authenticate,
  authorize(["read_all_users"]),
  cacheRead("users"),
  countAllActiveUsers.validate,
  countAllActiveUsers.invoke
);

router.get(
  "",
  authenticate,
  authorize(["read_all_users"]),
  cacheRead("users"),
  getAllActiveUsers.validate,
  getAllActiveUsers.invoke
);

router.post(
  "",
  authenticate,
  authorize(["create_user"]),
  invalidateCache(["users", "groups", "group-topics", "group-messages", "roles"]),
  createUser.validate,
  createUser.invoke
);

router.patch(
  "/:id",
  authenticate,
  authorize(["update_user"]),
  initUserResource,
  invalidateCache(["users", "groups", "group-topics", "group-messages", "roles"]),
  updateUser.validate,
  updateUser.invoke
);

router.get(
  "/:id",
  authenticate,
  authorize(["get_user"]),
  cacheRead("users"),
  getUser.validate,
  getUser.invoke
);

module.exports = router;
