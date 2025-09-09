// routes/index.js
const express = require("express");
const router = express.Router();
const titheRoute = require("./routes/titheRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const titheTypeRoute = require("./routes/titheTypeRoute");
const configurationRoute = require("./routes/configurationRoute");
const groupRoute = require("./routes/groupRoute");

router.use("/tithes", titheRoute);
router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/titheTypes", titheTypeRoute);
router.use("/configurations", configurationRoute);
router.use("/groups", groupRoute);

module.exports = router;
