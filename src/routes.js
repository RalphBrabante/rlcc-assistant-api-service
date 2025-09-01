// routes/index.js
const express = require("express");
const router = express.Router();
const titheRoute = require("./routes/titheRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const titheTypeRoute = require("./routes/titheTypeRoute");

router.use("/tithes", titheRoute);
router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/titheTypes", titheTypeRoute);

module.exports = router;
