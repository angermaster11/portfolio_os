const express = require("express");
const multer = require("multer");
const path = require("path");

const {
    getConfig,
    updateSystemPrompt,
    uploadKnowledgeFiles,
    deleteKnowledgeFile,
    chat
} = require("./askgpt.controller");

const protect = require("../auth/auth.middleware");

const router = express.Router();

// Multer config for AskGPT Knowledge Files Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../../uploads"));
    },
    filename: (req, file, cb) => {
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        cb(null, `askgpt-${Date.now()}-${cleanName}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB max file size
});

// Public / Desktop routes
router.get("/config", getConfig);
router.post("/chat", chat);

// Protected Admin routes
router.put("/system-prompt", protect, updateSystemPrompt);
router.post("/files", protect, upload.array("files", 10), uploadKnowledgeFiles);
router.delete("/files/:fileId", protect, deleteKnowledgeFile);

module.exports = router;
