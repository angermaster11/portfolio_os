require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const healthRoute = require("./routes/health");
const connectDB = require("./config/db");
const authRoutes = require("./modules/auth/auth.route");
const profileRoutes = require("./modules/profile/profile.route");
const projectsRoutes = require("./modules/projects/projects.route");
const askGPTRoutes = require("./modules/askgpt/askgpt.route");
const musicRoutes = require("./modules/music/music.route");
const widgetRoutes = require("./modules/widgets/widgets.route");
const presentationRoutes = require("./modules/presentation/presentation.route");

const app = express();

// constants
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

connectDB();

// routes
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/askgpt", askGPTRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/widgets", widgetRoutes);
app.use("/api/presentation", presentationRoutes);


const server = app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
    );
});
