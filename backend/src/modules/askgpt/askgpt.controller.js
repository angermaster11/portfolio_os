const fs = require("fs");
const path = require("path");
const AskGPT = require("../../models/AskGPT");
const Profile = require("../../models/Profile");
const Project = require("../../models/Project");
const { getEmbedding, cosineSimilarity, chunkText, getLLMResponse } = require("../../services/aiService");

// Helper to get or create the single AskGPT document
async function getOrCreateConfig() {
    let config = await AskGPT.findOne();
    if (!config) {
        config = await AskGPT.create({
            systemPrompt: "You are Arju's AI Portfolio Assistant, an expert developer and portfolio guide. Answer user questions accurately based on portfolio context, projects, profile, and uploaded knowledge base documents.",
            knowledgeFiles: []
        });
    }
    return config;
}

// GET /api/askgpt/config
const getConfig = async (req, res) => {
    try {
        const config = await getOrCreateConfig();
        const filesList = config.knowledgeFiles.map(f => ({
            _id: f._id,
            originalName: f.originalName,
            fileName: f.fileName,
            fileSize: f.fileSize,
            mimeType: f.mimeType,
            chunksCount: (f.chunks || []).length,
            textLength: (f.extractedText || "").length,
            createdAt: f.createdAt
        }));

        res.json({
            success: true,
            data: {
                systemPrompt: config.systemPrompt,
                knowledgeFiles: filesList
            }
        });
    } catch (err) {
        console.error("AskGPT getConfig error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// PUT /api/askgpt/system-prompt
const updateSystemPrompt = async (req, res) => {
    try {
        const { systemPrompt } = req.body;
        if (!systemPrompt || typeof systemPrompt !== "string") {
            return res.status(400).json({ success: false, error: "Valid systemPrompt string is required" });
        }

        const config = await getOrCreateConfig();
        config.systemPrompt = systemPrompt;
        await config.save();

        res.json({
            success: true,
            message: "System prompt updated successfully",
            data: { systemPrompt: config.systemPrompt }
        });
    } catch (err) {
        console.error("AskGPT updateSystemPrompt error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/askgpt/files (Generates Vector Embeddings for Chunks)
const uploadKnowledgeFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: "No files provided" });
        }

        const config = await getOrCreateConfig();
        const uploadedDocs = [];

        for (const file of req.files) {
            let extractedText = "";
            try {
                const fileExt = path.extname(file.originalname).toLowerCase();
                const isText = /txt|md|json|js|ts|jsx|tsx|py|html|css|php|c|cpp|h|sql|csv|xml|log|env/.test(fileExt) ||
                               file.mimetype.startsWith("text/");

                if (isText) {
                    extractedText = fs.readFileSync(file.path, "utf-8");
                } else {
                    extractedText = `[File: ${file.originalname} | Size: ${file.size} bytes]`;
                }
            } catch (readErr) {
                console.warn(`Could not read text for file ${file.originalname}:`, readErr);
                extractedText = `[File: ${file.originalname}]`;
            }

            // Split into text chunks and generate OpenAI Embeddings
            const rawChunks = chunkText(extractedText, 600, 100);
            const chunksWithEmbeddings = [];

            for (const chunk of rawChunks) {
                const embedding = await getEmbedding(chunk);
                chunksWithEmbeddings.push({
                    text: chunk,
                    embedding
                });
            }

            const docObj = {
                originalName: file.originalname,
                fileName: file.filename,
                filePath: file.path,
                fileSize: file.size,
                mimeType: file.mimetype,
                extractedText,
                chunks: chunksWithEmbeddings
            };

            config.knowledgeFiles.push(docObj);
            uploadedDocs.push(docObj);
        }

        await config.save();

        res.json({
            success: true,
            message: `Successfully processed & embedded ${uploadedDocs.length} knowledge file(s)`,
            count: uploadedDocs.length
        });
    } catch (err) {
        console.error("AskGPT uploadKnowledgeFiles error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE /api/askgpt/files/:fileId
const deleteKnowledgeFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const config = await getOrCreateConfig();

        const fileIndex = config.knowledgeFiles.findIndex(f => f._id.toString() === fileId);
        if (fileIndex === -1) {
            return res.status(404).json({ success: false, error: "File not found" });
        }

        const targetFile = config.knowledgeFiles[fileIndex];

        if (targetFile.filePath && fs.existsSync(targetFile.filePath)) {
            try {
                fs.unlinkSync(targetFile.filePath);
            } catch (fsErr) {
                console.warn("Could not delete file from disk:", fsErr);
            }
        }

        config.knowledgeFiles.splice(fileIndex, 1);
        await config.save();

        res.json({
            success: true,
            message: "Knowledge file deleted successfully"
        });
    } catch (err) {
        console.error("AskGPT deleteKnowledgeFile error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/askgpt/chat (Production-Grade Vector RAG + Groq/OpenAI LLM)
const chat = async (req, res) => {
    try {
        const { prompt, history = [] } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, error: "Prompt is required" });
        }

        const config = await getOrCreateConfig();
        const profile = await Profile.findOne() || {};
        const projects = await Project.find() || [];

        // 1. Convert user prompt into vector embedding using OpenAI
        const promptEmbedding = await getEmbedding(prompt);

        // 2. Vector Cosine Similarity Search across all knowledge file chunks
        const scoredChunks = [];
        const matchedSourceNames = new Set();

        config.knowledgeFiles.forEach(file => {
            const chunks = file.chunks || [];

            if (chunks.length > 0 && promptEmbedding.length > 0) {
                chunks.forEach(chunk => {
                    let score = 0;
                    if (chunk.embedding && chunk.embedding.length > 0) {
                        score = cosineSimilarity(promptEmbedding, chunk.embedding);
                    }
                    if (score > 0.35 || chunks.length <= 2) {
                        scoredChunks.push({
                            text: chunk.text,
                            fileName: file.originalName,
                            score
                        });
                        matchedSourceNames.add(file.originalName);
                    }
                });
            } else if (file.extractedText) {
                // Fallback substring keyword match if no embedding
                const textLower = file.extractedText.toLowerCase();
                const queryLower = prompt.toLowerCase();
                const isRelevant = queryLower.split(" ").some(kw => kw.length > 2 && textLower.includes(kw));

                if (isRelevant || config.knowledgeFiles.length <= 3) {
                    scoredChunks.push({
                        text: file.extractedText.slice(0, 1500),
                        fileName: file.originalName,
                        score: 0.5
                    });
                    matchedSourceNames.add(file.originalName);
                }
            }
        });

        // Sort by vector similarity score descending
        scoredChunks.sort((a, b) => b.score - a.score);
        const topChunks = scoredChunks.slice(0, 5);

        // 3. Assemble RAG Context Window
        let retrievedContext = "";

        if (topChunks.length > 0) {
            retrievedContext += `--- [VECTOR RETRIEVED KNOWLEDGE BASE CHUNKS] ---\n`;
            topChunks.forEach(c => {
                retrievedContext += `[Source File: ${c.fileName} | Vector Score: ${c.score.toFixed(3)}]\n${c.text}\n\n`;
            });
        }

        // Add Profile & Showcase Projects Context
        if (profile.name || profile.bio) {
            retrievedContext += `--- [DEVELOPER PROFILE CONTEXT] ---\nName: ${profile.name || "Arju Srivastava"}\nTitle: ${profile.title || "Software Engineer"}\nBio: ${profile.bio || ""}\nTech Stack: ${profile.techStack || ""}\n\n`;
        }

        if (projects.length > 0) {
            retrievedContext += `--- [SHOWCASE PROJECTS CONTEXT] ---\n` +
                projects.map(p => `- ${p.title}: ${p.description || "Project"} (Tech: ${p.techStack || "N/A"})`).join("\n") + "\n\n";
        }

        // 4. Generate LLM Answer using Groq (llama-3.3-70b-versatile) or OpenAI (gpt-4o-mini)
        const llmReply = await getLLMResponse(config.systemPrompt, prompt, retrievedContext, history);

        res.json({
            success: true,
            data: {
                reply: llmReply,
                sources: Array.from(matchedSourceNames),
                vectorRAGUsed: topChunks.length > 0,
                knowledgeFilesCount: config.knowledgeFiles.length
            }
        });
    } catch (err) {
        console.error("AskGPT chat error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    getConfig,
    updateSystemPrompt,
    uploadKnowledgeFiles,
    deleteKnowledgeFile,
    chat
};
