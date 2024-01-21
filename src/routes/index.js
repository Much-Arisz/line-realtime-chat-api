
const express = require("express");
const router = express.Router();

const auth = require("./auth.route");
const line = require("./line.route");
const chat = require("./chat.route");

router.use("/auth", auth);
router.use("/line", line);
router.use("/chat", chat);

module.exports = router;