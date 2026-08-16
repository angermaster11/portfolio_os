const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, default: "Arju" },
    album: { type: String, default: "Single" },
    audioUrl: { type: String, required: true },
    coverUrl: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Music", musicSchema);
