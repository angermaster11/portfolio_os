const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const protect = require("../auth/auth.middleware");
const {
    getPresentation,
    uploadPresentationFile,
    deletePresentationFile
} = require("./presentation.controller");

// Configure Multer for PPT / PDF / Presentation document uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../../uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, "presentation-" + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.get("/", getPresentation);
router.post("/upload", protect, upload.single("pptFile"), uploadPresentationFile);
router.delete("/file", protect, deletePresentationFile);

module.exports = router;
