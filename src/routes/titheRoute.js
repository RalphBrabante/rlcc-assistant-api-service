// routes/index.js
const express = require("express");
const router = express.Router();
const createTithe = require("../controllers/tithe/createTithe");

router.post("", createTithe.validate, createTithe.invoke);

module.exports = router;
