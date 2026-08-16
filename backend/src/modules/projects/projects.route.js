const express = require("express");

const {
    getTree,
    createNode,
    updateNode,
    deleteNode,
    cloneGithub
} = require("./projects.controller");

const protect = require("../auth/auth.middleware");

const router = express.Router();

// Public
router.get("/tree", getTree);

// Protected
router.post("/node", protect, createNode);
router.put("/node/:id", protect, updateNode);
router.delete("/node/:id", protect, deleteNode);
router.post("/clone", protect, cloneGithub);

module.exports = router;
