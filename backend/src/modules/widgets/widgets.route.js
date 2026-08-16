const express = require("express");
const router = express.Router();
const protect = require("../auth/auth.middleware");
const { getWidgets, updateWidgets } = require("./widgets.controller");

router.get("/", getWidgets);
router.post("/", protect, updateWidgets);

module.exports = router;
