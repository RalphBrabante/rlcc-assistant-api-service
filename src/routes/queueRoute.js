// routes/index.js
const express = require("express");
const router = express.Router();
const getSpecificQueue = require("../controllers/queue/getSpecificQueue");
const authenticate = require("../middlewares/authenticate");
const requireSuperUser = require("../middlewares/requireSuperUser");
const { cacheRead } = require("../middlewares/cacheMiddleware");

router.get(
  "/:queueName",
  authenticate,
  requireSuperUser,
  cacheRead("queues"),
  getSpecificQueue.validate,
  getSpecificQueue.invoke
);

module.exports = router;
