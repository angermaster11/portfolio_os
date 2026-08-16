// AI Service handling OpenAI Embeddings & LLM Chat Completions (Groq / OpenAI)

// Cosine similarity between two vector arrays
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
        return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Split text into overlapping chunks for indexing
function chunkText(text, chunkSize = 600, overlap = 100) {
    if (!text || typeof text !== "string") return [];
    const cleanText = text.trim();
    if (cleanText.length <= chunkSize) return [cleanText];

    const chunks = [];
    let start = 0;
    while (start < cleanText.length) {
        const end = Math.min(start + chunkSize, cleanText.length);
        const chunk = cleanText.slice(start, end);
        chunks.push(chunk);
        start += chunkSize - overlap;
    }
    return chunks;
}

// OpenAI Embeddings API call
async function getEmbedding(text) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ OPENAI_API_KEY not found in environment.");
        return [];
    }

    try {
        const response = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "text-embedding-3-small",
                input: text.slice(0, 8000)
            })
        });

        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].embedding) {
            return data.data[0].embedding;
        }

        // Fallback if text-embedding-3-small fails
        if (data.error) {
            console.warn("Embedding API error, retrying text-embedding-ada-002:", data.error.message);
            const retryRes = await fetch("https://api.openai.com/v1/embeddings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "text-embedding-ada-002",
                    input: text.slice(0, 8000)
                })
            });
            const retryData = await retryRes.json();
            if (retryData.data && retryData.data[0] && retryData.data[0].embedding) {
                return retryData.data[0].embedding;
            }
        }
        console.error("OpenAI Embedding generation failed:", data);
        return [];
    } catch (err) {
        console.error("Error generating vector embedding:", err);
        return [];
    }
}

// Real LLM Chat Completion call (Groq or OpenAI)
async function getLLMResponse(systemPrompt, userPrompt, retrievedContext, history = []) {
    const groqKey = process.env.GROQ_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    let endpoint = "https://api.openai.com/v1/chat/completions";
    let apiKey = openAIKey;
    let model = "gpt-4o-mini";

    // Prioritize Groq if GROQ_API_KEY is provided, else fallback to OpenAI
    if (groqKey && groqKey.trim().length > 5) {
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        apiKey = groqKey.trim();
        model = "llama-3.3-70b-versatile";
    }

    if (!apiKey) {
        return "⚠️ AI API Key is not configured. Please set GROQ_API_KEY or OPENAI_API_KEY in backend/.env.";
    }

    const messages = [
        {
            role: "system",
            content: `${systemPrompt}\n\n[RETRIEVED VECTOR RAG KNOWLEDGE BASE CONTEXT]:\n${retrievedContext || "No specific vector context matched."}`
        }
    ];

    // Append history
    if (Array.isArray(history)) {
        history.slice(-6).forEach(h => {
            if (h.sender === "user") messages.push({ role: "user", content: h.text });
            if (h.sender === "ai") messages.push({ role: "assistant", content: h.text });
        });
    }

    messages.push({ role: "user", content: userPrompt });

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.6,
                max_tokens: 1200
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        }

        if (data.error) {
            console.error("LLM API returned error:", data.error);
            // If Groq failed, fallback to OpenAI directly
            if (endpoint.includes("groq") && openAIKey) {
                console.log("Falling back to OpenAI API...");
                return getOpenAIFallback(systemPrompt, userPrompt, retrievedContext, history, openAIKey);
            }
            return `⚠️ LLM Error (${data.error.code || 'API Error'}): ${data.error.message}`;
        }

        return "⚠️ Unexpected API response structure.";
    } catch (err) {
        console.error("Fetch LLM Error:", err);
        return `❌ Error connecting to AI provider: ${err.message}`;
    }
}

async function getOpenAIFallback(systemPrompt, userPrompt, retrievedContext, history, apiKey) {
    const messages = [
        {
            role: "system",
            content: `${systemPrompt}\n\n[RETRIEVED VECTOR RAG KNOWLEDGE BASE CONTEXT]:\n${retrievedContext}`
        }
    ];
    if (Array.isArray(history)) {
        history.slice(-6).forEach(h => {
            if (h.sender === "user") messages.push({ role: "user", content: h.text });
            if (h.sender === "ai") messages.push({ role: "assistant", content: h.text });
        });
    }
    messages.push({ role: "user", content: userPrompt });

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messages,
                temperature: 0.6,
                max_tokens: 1200
            })
        });
        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        }
        return `⚠️ OpenAI Error: ${data.error?.message || "Failed to generate"}`;
    } catch (e) {
        return `❌ OpenAI Connection Error: ${e.message}`;
    }
}

module.exports = {
    getEmbedding,
    cosineSimilarity,
    chunkText,
    getLLMResponse
};
