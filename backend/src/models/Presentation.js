const mongoose = require("mongoose");

const presentationSchema = new mongoose.Schema({
    title: { type: String, default: "My Portfolio Presentation" },
    pptUrl: { type: String, default: "" }, // Original file URL
    pdfUrl: { type: String, default: "" }, // PDF file URL
    slideImages: [{ type: String }], // Array of slide PNG image URLs
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "" },
    slideInterval: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model("Presentation", presentationSchema);
