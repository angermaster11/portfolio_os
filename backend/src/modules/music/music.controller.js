const fs = require("fs");
const path = require("path");
const Music = require("../../models/Music");

// GET /api/music - Fetch all music tracks
const getAllMusic = async (req, res) => {
    try {
        const tracks = await Music.find().sort({ createdAt: -1 });
        res.json({ success: true, data: tracks });
    } catch (err) {
        console.error("getAllMusic error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/music - Upload audio + cover art
const uploadMusic = async (req, res) => {
    try {
        const { title, artist, album, duration } = req.body;
        const files = req.files || {};

        if (!files.audio || files.audio.length === 0) {
            return res.status(400).json({ success: false, error: "Audio file is required" });
        }

        const audioFile = files.audio[0];
        const audioUrl = `/uploads/${audioFile.filename}`;

        let coverUrl = "";
        if (files.cover && files.cover.length > 0) {
            coverUrl = `/uploads/${files.cover[0].filename}`;
        }

        const trackName = title && title.trim() ? title.trim() : path.parse(audioFile.originalname).name;

        const newTrack = await Music.create({
            title: trackName,
            artist: artist && artist.trim() ? artist.trim() : "Arju",
            album: album && album.trim() ? album.trim() : "Portfolio Beats",
            audioUrl,
            coverUrl,
            duration: Number(duration) || 0,
            fileSize: audioFile.size,
            mimeType: audioFile.mimetype
        });

        res.json({
            success: true,
            message: "Track uploaded successfully",
            data: newTrack
        });
    } catch (err) {
        console.error("uploadMusic error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE /api/music/:id - Delete a music track
const deleteMusic = async (req, res) => {
    try {
        const { id } = req.params;
        const track = await Music.findById(id);

        if (!track) {
            return res.status(404).json({ success: false, error: "Track not found" });
        }

        // Remove files from disk
        if (track.audioUrl) {
            const fullPath = path.join(__dirname, "../../../", track.audioUrl);
            if (fs.existsSync(fullPath)) {
                try { fs.unlinkSync(fullPath); } catch (e) { console.warn(e); }
            }
        }
        if (track.coverUrl) {
            const fullPath = path.join(__dirname, "../../../", track.coverUrl);
            if (fs.existsSync(fullPath)) {
                try { fs.unlinkSync(fullPath); } catch (e) { console.warn(e); }
            }
        }

        await Music.findByIdAndDelete(id);

        res.json({ success: true, message: "Track deleted successfully" });
    } catch (err) {
        console.error("deleteMusic error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    getAllMusic,
    uploadMusic,
    deleteMusic
};
