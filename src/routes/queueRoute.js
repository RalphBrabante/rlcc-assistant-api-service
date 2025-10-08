// routes/index.js
const express = require("express");
const router = express.Router();
const getSpecificQueue = require("../controllers/queue/getSpecificQueue");
const authenticate = require("../middlewares/authenticate");

router.get(
  "/:queueName",
  authenticate,
  getSpecificQueue.validate,
  getSpecificQueue.invoke
);

module.exports = router;
