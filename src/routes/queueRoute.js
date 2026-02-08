// routes/index.js
const express = require("express");
const router = express.Router();
const getSpecificQueue = require("../controllers/queue/getSpecificQueue");
const authenticate = require("../middlewares/authenticate");
const requireSuperUser = require("../middlewares/requireSuperUser");

router.get(
  "/:queueName",
  authenticate,
  requireSuperUser,
  getSpecificQueue.validate,
  getSpecificQueue.invoke
);

module.exports = router;
