// routes/index.js
const express = require("express");
const router = express.Router();
const titheRoute = require("./routes/titheRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");

router.use("/tithes", titheRoute);
router.use("/users", userRoute);
router.use("/auth", authRoute);

module.exports = router;
