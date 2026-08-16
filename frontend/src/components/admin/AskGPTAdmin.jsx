import { useState, useEffect } from "react";
import { apiGet, apiPut, apiDelete } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";

function AskGPTAdmin() {
    const { token } = useAuth();
    const [systemPrompt, setSystemPrompt] = useState("");
    const [knowledgeFiles, setKnowledgeFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingPrompt, setSavingPrompt] = useState(false);
    const [savedPrompt, setSavedPrompt] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await apiGet("/askgpt/config");
            if (res.data) {
                setSystemPrompt(res.data.systemPrompt || "");
                setKnowledgeFiles(res.data.knowledgeFiles || []);
            }
        } catch (err) {
            console.error("Failed to load AskGPT config:", err);
            showToast("Failed to load AskGPT configuration", "error");
        }
        setLoading(false);
    };

    const showToast = (text, type = "success") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleSaveSystemPrompt = async () => {
        setSavingPrompt(true);
        try {
            const res = await apiPut("/askgpt/system-prompt", { systemPrompt }, token);
            if (res.success) {
                setSavedPrompt(true);
                showToast("System prompt updated successfully!", "success");
                setTimeout(() => setSavedPrompt(false), 2500);
            } else {
                showToast(res.error || "Failed to save system prompt", "error");
            }
        } catch (err) {
            showToast("Error saving system prompt", "error");
        }
        setSavingPrompt(false);
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleUploadFiles = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return;

        setUploading(true);
        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append("files", file);
            });

            const res = await fetch("/api/askgpt/files", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                showToast(`Successfully uploaded ${selectedFiles.length} knowledge file(s)!`, "success");
                setSelectedFiles([]);
                const fileInput = document.getElementById("askgpt-file-input");
                if (fileInput) fileInput.value = "";
                await loadConfig();
            } else {
                showToast(data.error || "Failed to upload files", "error");
            }
        } catch (err) {
            console.error("Upload error:", err);
            showToast("Failed to upload files to server", "error");
        }
        setUploading(false);
    };

    const handleDeleteFile = async (fileId, fileName) => {
        if (!window.confirm(`Are you sure you want to delete "${fileName}" from the AskGPT knowledge base?`)) {
            return;
        }

        try {
            const res = await apiDelete(`/askgpt/files/${fileId}`, token);
            if (res.success) {
                showToast(`Deleted "${fileName}"`, "success");
                setKnowledgeFiles(prev => prev.filter(f => f._id !== fileId));
            } else {
                showToast(res.error || "Failed to delete file", "error");
            }
        } catch (err) {
            showToast("Error deleting file", "error");
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <span className="admin-login-spinner" />
                <p>Loading AskGPT configuration...</p>
            </div>
        );
    }

    return (
        <div className="profile-manager askgpt-admin-container">
            {toastMessage && (
                <div className={`askgpt-toast ${toastMessage.type}`}>
                    {toastMessage.type === "success" ? "✓ " : "⚠️ "}
                    {toastMessage.text}
                </div>
            )}

            {/* 1. System Prompt Section */}
            <div className="profile-card">
                <h3 className="profile-section-title">🤖 System Prompt Configuration</h3>
                <p className="askgpt-section-desc">
                    Set custom system instructions & role prompt for the AskGPT Desktop AI assistant.
                </p>

                <div className="profile-field profile-field-full">
                    <label className="profile-field-label">System Prompt Instructions</label>
                    <textarea
                        className="profile-field-textarea"
                        rows={6}
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="e.g. You are Arju's AI Portfolio Assistant, an expert developer and portfolio guide..."
                    />
                    <span className="askgpt-hint">
                        Instruct the AI how to behave, respond, and act when answering questions on the desktop.
                    </span>
                </div>

                <div className="profile-save-bar" style={{ marginTop: "16px", paddingTop: "16px", borderTop: "none" }}>
                    <button
                        className={`profile-save-btn ${savedPrompt ? "saved" : ""}`}
                        onClick={handleSaveSystemPrompt}
                        disabled={savingPrompt}
                    >
                        {savingPrompt ? (
                            <span className="admin-login-spinner" />
                        ) : savedPrompt ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Saved Prompt!
                            </>
                        ) : (
                            <>
                                💾 Save System Prompt
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 2. Knowledge Base Upload Section */}
            <div className="profile-card" style={{ marginTop: "24px" }}>
                <div className="profile-section-header">
                    <div>
                        <h3 className="profile-section-title">📚 Knowledge Base Files (RAG Engine)</h3>
                        <p className="askgpt-section-desc">
                            Upload documents, text files, markdown, json, or code files. AskGPT uses RAG on these files to answer queries.
                        </p>
                    </div>
                    <span className="askgpt-badge">{knowledgeFiles.length} File(s) Active</span>
                </div>

                {/* Upload Form */}
                <form className="askgpt-upload-form" onSubmit={handleUploadFiles}>
                    <input
                        type="file"
                        id="askgpt-file-input"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                    />
                    <label htmlFor="askgpt-file-input" className="askgpt-dropzone">
                        <div className="dropzone-icon">📁</div>
                        <div className="dropzone-text">
                            <strong>Click to select multiple files</strong> or drag and drop here
                        </div>
                        <span className="dropzone-sub">Supports .txt, .md, .json, .js, .py, .html, .css, code files & docs</span>
                    </label>

                    {selectedFiles.length > 0 && (
                        <div className="askgpt-selected-preview">
                            <h4>Selected Files for Upload ({selectedFiles.length}):</h4>
                            <ul>
                                {selectedFiles.map((f, i) => (
                                    <li key={i}>
                                        📄 <strong>{f.name}</strong> <span>({formatBytes(f.size)})</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="submit"
                                className="profile-save-btn"
                                disabled={uploading}
                                style={{ width: "100%", justifyContent: "center" }}
                            >
                                {uploading ? (
                                    <>
                                        <span className="admin-login-spinner" />
                                        Extracting & Saving Knowledge...
                                    </>
                                ) : (
                                    <>⬆️ Upload {selectedFiles.length} Selected File(s)</>
                                )}
                            </button>
                        </div>
                    )}
                </form>

                {/* Uploaded Files Grid */}
                <div className="askgpt-files-section">
                    <h4 className="askgpt-subhead">Uploaded Knowledge Files</h4>
                    {knowledgeFiles.length === 0 ? (
                        <p className="profile-empty">
                            No knowledge base files uploaded yet. Select files above to enable RAG system!
                        </p>
                    ) : (
                        <div className="askgpt-grid">
                            {knowledgeFiles.map((file) => (
                                <div key={file._id} className="askgpt-file-card">
                                    <div className="k-icon">📄</div>
                                    <div className="k-info">
                                        <div className="k-title" title={file.originalName}>
                                            {file.originalName}
                                        </div>
                                        <div className="k-meta">
                                            <span>{formatBytes(file.fileSize)}</span>
                                            <span>•</span>
                                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="profile-card-remove"
                                        style={{ position: "static" }}
                                        onClick={() => handleDeleteFile(file._id, file.originalName)}
                                        title="Delete file"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AskGPTAdmin;
