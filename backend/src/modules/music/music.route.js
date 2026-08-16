const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../auth/auth.middleware");
const { getAllMusic, uploadMusic, deleteMusic } = require("./music.controller");

// Setup Multer Storage for Music & Cover Images
const uploadsDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `music-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "audio") {
            const isAudio = /audio|mp3|wav|ogg|m4a|flac|aac|mpeg/.test(file.mimetype) ||
                            /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.originalname);
            if (isAudio) return cb(null, true);
            return cb(new Error("Only audio files (mp3, wav, ogg, m4a, flac) are allowed"));
        } else if (file.fieldname === "cover") {
            const isImage = file.mimetype.startsWith("image/") || /\.(png|jpg|jpeg|webp|gif)$/i.test(file.originalname);
            if (isImage) return cb(null, true);
            return cb(new Error("Cover art must be an image file"));
        }
        cb(null, true);
    }
});

const musicUpload = upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 }
]);

router.get("/", getAllMusic);
router.post("/", authMiddleware, musicUpload, uploadMusic);
router.delete("/:id", authMiddleware, deleteMusic);

module.exports = router;
