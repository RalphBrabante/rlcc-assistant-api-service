// routes/index.js
const express = require("express");
const router = express.Router();
const titheRoute = require("./routes/titheRoute");

router.use("/tithes", titheRoute);

module.exports = router;
