const express = require("express");

const {
    register,
    login,
    logout,
} = require("./auth.controller");

const protect = require("./auth.middleware");

const router = express.Router();

// Public
router.post("/login", login);

// Private registration
router.post("/register", (req, res, next) => {
    const registerSecret = req.headers["x-register-secret"];

    if (!registerSecret) {
        return res.status(403).json({
            success: false,
            message: "Registration is private",
        });
    }

    if (registerSecret !== process.env.REGISTER_SECRET) {
        return res.status(403).json({
            success: false,
            message: "Invalid registration secret",
        });
    }

    next();
}, register);

// Authenticated
router.post("/logout", protect, logout);

module.exports = router;