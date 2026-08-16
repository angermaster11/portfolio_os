import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { apiGet, apiPost } from "../../hooks/useApi";

function AskGPT() {
    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "Hello! 👋 I am **Arju's AI Assistant**. How can I assist you today?",
            sources: []
        }
    ]);
    const [inputPrompt, setInputPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [ragInfo, setRagInfo] = useState({ count: 0, systemPrompt: "" });
    const chatEndRef = useRef(null);

    useEffect(() => {
        loadConfig();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const loadConfig = async () => {
        try {
            const res = await apiGet("/askgpt/config");
            if (res.data) {
                setRagInfo({
                    count: (res.data.knowledgeFiles || []).length,
                    systemPrompt: res.data.systemPrompt || ""
                });
            }
        } catch (err) {
            console.error("Failed to load AskGPT metadata:", err);
        }
    };

    const handleSendMessage = async (textToSend) => {
        const query = textToSend || inputPrompt;
        if (!query.trim() || loading) return;

        const userMsg = { sender: "user", text: query };
        setMessages(prev => [...prev, userMsg]);
        setInputPrompt("");
        setLoading(true);

        try {
            const res = await apiPost("/askgpt/chat", {
                prompt: query,
                history: messages
            });

            if (res.data && res.data.reply) {
                const aiMsg = {
                    sender: "ai",
                    text: res.data.reply,
                    sources: res.data.sources || []
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [
                    ...prev,
                    { sender: "ai", text: "⚠️ Sorry, I could not generate a response. Please try again." }
                ]);
            }
        } catch (err) {
            console.error("AskGPT chat error:", err);
            setMessages(prev => [
                ...prev,
                { sender: "ai", text: "❌ Connection error. Please ensure the backend server is running." }
            ]);
        }
        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                sender: "ai",
                text: "Chat cleared! 🧹 Ask me anything about Arju's portfolio, skills, or knowledge base files.",
                sources: []
            }
        ]);
    };

    const starterPills = [
        "What do you know about Arju?",
        "What projects has Arju built?",
        "What technical skills & stack does Arju have?",
        "Show uploaded RAG knowledge files"
    ];

    return (
        <div className="askgpt-app">
            {/* App Header */}
            <div className="askgpt-header">
                <div className="askgpt-header-left">
                    <div className="askgpt-avatar-badge">🤖</div>
                    <div>
                        <div className="askgpt-title-row">
                            <h3>AskGPT AI Assistant</h3>
                            <span className="askgpt-online-badge">
                                <span className="green-dot" /> Online RAG
                            </span>
                        </div>
                        <p className="askgpt-subtitle">
                            {ragInfo.count > 0
                                ? `📚 RAG Active (${ragInfo.count} Knowledge Base Files)`
                                : "💡 RAG Engine Active (Default Knowledge Base)"}
                        </p>
                    </div>
                </div>

                <button className="askgpt-clear-btn" onClick={handleClearChat} title="Clear Conversation">
                    🗑️ Clear
                </button>
            </div>

            {/* Main Chat Body */}
            <div className="askgpt-body">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`askgpt-msg-wrapper ${msg.sender}`}>
                        <div className="askgpt-msg-avatar">
                            {msg.sender === "user" ? "👤" : "🤖"}
                        </div>

                        <div className="askgpt-msg-content">
                            <div className="askgpt-msg-bubble">
                                {msg.sender === "ai" ? (
                                    <div className="markdown-preview">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p>{msg.text}</p>
                                )}
                            </div>

                            {msg.sources && msg.sources.length > 0 && (
                                <div className="askgpt-sources-tag">
                                    <span>📚 Referenced Sources: </span>
                                    {msg.sources.map((src, sIdx) => (
                                        <span key={sIdx} className="source-chip">📄 {src}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="askgpt-msg-wrapper ai">
                        <div className="askgpt-msg-avatar">🤖</div>
                        <div className="askgpt-msg-bubble loading-bubble">
                            <div className="typing-dots">
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className="loading-text">AskGPT is analyzing RAG knowledge base...</span>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Starter Suggestion Pills */}
            <div className="askgpt-pills-bar">
                {starterPills.map((pill, idx) => (
                    <button
                        key={idx}
                        className="askgpt-pill"
                        onClick={() => handleSendMessage(pill)}
                        disabled={loading}
                    >
                        {pill}
                    </button>
                ))}
            </div>

            {/* Input Bar */}
            <div className="askgpt-input-container">
                <textarea
                    className="askgpt-textarea"
                    rows={1}
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AskGPT anything about Arju's portfolio or knowledge base... (Press Enter)"
                    disabled={loading}
                />

                <button
                    className="askgpt-send-btn"
                    onClick={() => handleSendMessage()}
                    disabled={loading || !inputPrompt.trim()}
                >
                    {loading ? "..." : "Send ➔"}
                </button>
            </div>
        </div>
    );
}

export default AskGPT;
