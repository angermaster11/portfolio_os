import { useState, useEffect } from "react";
import { apiGet, apiPost, apiDelete } from "../../hooks/useApi";

const API_BASE = "";

function PresentationAdmin() {
    const [title, setTitle] = useState("My Portfolio Presentation");
    const [pptData, setPptData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await apiGet("/presentation");
            if (res.data) {
                setPptData(res.data);
                setTitle(res.data.title || "My Portfolio Presentation");
            }
        } catch (err) {
            console.error("Failed to fetch PPT data:", err);
            showToast("Error loading presentation config", "error");
        }
        setLoading(false);
    };

    const showToast = (text, type = "success") => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile && !title) return;

        setUploading(true);
        try {
            const formData = new FormData();
            if (selectedFile) {
                formData.append("pptFile", selectedFile);
            }
            formData.append("title", title);

            const res = await apiPost("/presentation/upload", formData);

            if (res.success) {
                setPptData(res.data);
                setSelectedFile(null);
                showToast("PPT file uploaded & saved successfully! 📊", "success");
            } else {
                showToast(res.error || res.message || "Upload failed", "error");
            }
        } catch (err) {
            console.error("PPT upload error:", err);
            showToast(err.message || "Upload failed", "error");
        }
        setUploading(false);
    };

    const handleDeleteFile = async () => {
        if (!window.confirm("Are you sure you want to remove the current PPT file?")) return;

        try {
            const res = await apiDelete("/presentation/file");
            if (res.success) {
                setPptData(res.data);
                showToast("PPT file removed", "success");
            } else {
                showToast(res.error || "Failed to delete file", "error");
            }
        } catch (err) {
            console.error("Delete PPT file error:", err);
            showToast(err.message || "Failed to delete file", "error");
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <span className="admin-login-spinner" />
                <p>Loading Presentation Config...</p>
            </div>
        );
    }

    return (
        <div className="profile-manager askgpt-admin-container">
            {toast && (
                <div className={`askgpt-toast ${toast.type}`}>
                    {toast.type === "success" ? "✓ " : "⚠️ "}
                    {toast.text}
                </div>
            )}

            <form onSubmit={handleUpload}>
                <div className="profile-card">
                    <div className="profile-section-header">
                        <div>
                            <h3 className="profile-section-title">📊 Upload Portfolio Presentation / PPT File</h3>
                            <p className="askgpt-section-desc">
                                Upload your PDF, PPT, PPTX, or slides presentation document here. It will automatically play on the Portfolio Showcase UI.
                            </p>
                        </div>
                    </div>

                    <div className="profile-field" style={{ marginBottom: "16px" }}>
                        <label className="profile-field-label">Presentation Title</label>
                        <input
                            type="text"
                            className="profile-field-input"
                            placeholder="e.g. Arju Srivastava - Portfolio Deck"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Current File Status */}
                    {pptData?.pptUrl ? (
                        <div className="ppt-admin-file-card">
                            <div className="ppt-admin-file-info">
                                <span className="ppt-file-icon">📄</span>
                                <div>
                                    <div className="ppt-file-name">{pptData.fileName || "Uploaded Presentation File"}</div>
                                    <div className="ppt-file-meta">
                                        Type: {pptData.fileType?.toUpperCase() || "DOCUMENT"} • Status: 🟢 Ready for playback on UI
                                    </div>
                                </div>
                            </div>
                            <div className="ppt-admin-file-actions">
                                <a
                                    href={`${API_BASE}${pptData.pptUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="profile-add-btn"
                                    style={{ textDecoration: "none" }}
                                >
                                    👁️ View File
                                </a>
                                <button
                                    type="button"
                                    className="profile-card-remove"
                                    style={{ position: "static" }}
                                    onClick={handleDeleteFile}
                                    title="Delete File"
                                >
                                    × Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="ppt-admin-no-file">
                            <span>⚠️ No presentation file uploaded yet.</span>
                        </div>
                    )}

                    {/* File Input Box */}
                    <div className="profile-field" style={{ marginTop: "20px" }}>
                        <label className="profile-field-label">Select PDF / PPT File to Upload *</label>
                        <input
                            type="file"
                            accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg"
                            className="profile-field-input"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                        {selectedFile && (
                            <p style={{ fontSize: "12px", color: "#60a5fa", marginTop: "6px" }}>
                                Selected File: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </p>
                        )}
                    </div>

                    <div className="profile-save-bar" style={{ marginTop: "24px" }}>
                        <button
                            type="submit"
                            className="profile-save-btn"
                            disabled={uploading}
                            style={{ width: "100%", justifyContent: "center" }}
                        >
                            {uploading ? (
                                <>
                                    <span className="admin-login-spinner" />
                                    Uploading Presentation...
                                </>
                            ) : (
                                <>📤 Upload & Save Presentation File</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default PresentationAdmin;
