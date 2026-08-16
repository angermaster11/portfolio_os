const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema({
    text: { type: String, required: true },
    embedding: [Number]
});

const knowledgeFileSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    extractedText: { type: String, default: "" },
    chunks: [chunkSchema],
    createdAt: { type: Date, default: Date.now }
});

const askGPTSchema = new mongoose.Schema({
    systemPrompt: {
        type: String,
        default: "You are Arju's AI Portfolio Assistant, an expert developer and portfolio guide. Answer user questions accurately based on the portfolio context, projects, profile, and uploaded knowledge base documents."
    },
    knowledgeFiles: [knowledgeFileSchema]
}, { timestamps: true });

module.exports = mongoose.model("AskGPT", askGPTSchema);
