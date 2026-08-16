const express = require("express");
const multer = require("multer");
const path = require("path");

const {
    getProfile,
    updateProfile,
    uploadPhoto
} = require("./profile.controller");

const protect = require("../auth/auth.middleware");

const router = express.Router();

// Multer config for photo upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../../uploads"));
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `profile-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif/;
        const extname = allowed.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowed.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    }
});

// Public
router.get("/", getProfile);

// Protected
router.put("/", protect, updateProfile);
router.post("/photo", protect, upload.single("photo"), uploadPhoto);

module.exports = router;
