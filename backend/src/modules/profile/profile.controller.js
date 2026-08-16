const Profile = require("../../models/Profile");
const path = require("path");
const fs = require("fs");

// GET /api/profile — public
const getProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne();

        if (!profile) {
            profile = await Profile.create({
                skills: ["React.js", "Node.js", "MongoDB", "Express.js", "JavaScript", "Docker", "Python", "REST APIs", "Git & GitHub", "Tailwind CSS"]
            });
        } else if (!profile.skills || profile.skills.length === 0) {
            profile.skills = ["React.js", "Node.js", "MongoDB", "Express.js", "JavaScript", "Docker", "Python", "REST APIs", "Git & GitHub", "Tailwind CSS"];
            await profile.save();
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// PUT /api/profile — protected
const updateProfile = async (req, res) => {
    try {
        const updateData = req.body;

        // Remove photo from body update (handled separately)
        delete updateData.photo;

        const profile = await Profile.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile
        });
    } catch (error) {
        console.error("Update profile error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// POST /api/profile/photo — protected
const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const photoPath = `/uploads/${req.file.filename}`;

        let profile = await Profile.findOne();

        if (!profile) {
            profile = await Profile.create({ photo: photoPath });
        } else {
            // Delete old photo if exists
            if (profile.photo) {
                const oldPath = path.join(
                    __dirname,
                    "../../../",
                    profile.photo
                );

                if (fs.existsSync(oldPath)) {
                    try {
                        fs.unlinkSync(oldPath);
                    } catch (e) {
                        console.error("Old photo removal error:", e);
                    }
                }
            }

            profile.photo = photoPath;
            await profile.save();
        }

        res.status(200).json({
            success: true,
            message: "Photo uploaded successfully",
            data: { photo: photoPath }
        });
    } catch (error) {
        console.error("Upload photo error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadPhoto
};
