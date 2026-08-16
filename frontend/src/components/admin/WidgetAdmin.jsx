import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../../hooks/useApi";

function WidgetAdmin() {
    const [enabled, setEnabled] = useState(true);
    const [widgetTitle, setWidgetTitle] = useState("Highlights & Spotlight");
    const [slideInterval, setSlideInterval] = useState(5);
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchWidgetConfig();
    }, []);

    const fetchWidgetConfig = async () => {
        try {
            const res = await apiGet("/widgets");
            if (res.data) {
                setEnabled(res.data.enabled !== false);
                setWidgetTitle(res.data.title || "Highlights & Spotlight");
                setSlideInterval(res.data.slideInterval || 5);
                setSlides(res.data.slides || []);
            }
        } catch (err) {
            console.error("Failed to fetch widget config:", err);
            showToast("Failed to load widget config", "error");
        }
        setLoading(false);
    };

    const showToast = (text, type = "success") => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleAddSlide = () => {
        setSlides(prev => [
            ...prev,
            {
                badge: "Highlight",
                title: "New Highlight / Feature",
                description: "Write your custom advertisement or highlight description here...",
                icon: "✨",
                linkText: "Learn More",
                linkApp: "profile",
                bgGradient: "blue",
                isVisible: true
            }
        ]);
    };

    const handleSlideChange = (index, field, value) => {
        setSlides(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const handleRemoveSlide = (index) => {
        setSlides(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveConfig = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await apiPost("/widgets", {
                enabled,
                title: widgetTitle,
                slideInterval: Number(slideInterval),
                slides
            });

            if (res.success) {
                showToast("Desktop Sidebar Widget updated successfully! 📢", "success");
            } else {
                showToast(res.error || res.message || "Failed to save configuration", "error");
            }
        } catch (err) {
            console.error("Save widget error:", err);
            showToast(err.message || "Error saving widget config", "error");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <span className="admin-login-spinner" />
                <p>Loading Widget Configuration...</p>
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

            <form onSubmit={handleSaveConfig}>
                {/* 1. Master Toggle & Global Settings */}
                <div className="profile-card">
                    <div className="profile-section-header">
                        <div>
                            <h3 className="profile-section-title">⚙️ Master Display & Rotation Settings</h3>
                            <p className="askgpt-section-desc">
                                Turn the desktop highlights sidebar on or off, edit header title, and set timer speed.
                            </p>
                        </div>
                    </div>

                    <div className="profile-fields-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                        {/* Master Toggle */}
                        <div className="profile-field">
                            <label className="profile-field-label">Widget Status on Desktop</label>
                            <button
                                type="button"
                                className={`widget-toggle-switch ${enabled ? "on" : "off"}`}
                                onClick={() => setEnabled(prev => !prev)}
                            >
                                <span className="toggle-knob" />
                                <span className="toggle-text">
                                    {enabled ? "🟢 Enabled (Visible on Desktop)" : "🔴 Disabled (Hidden from Desktop)"}
                                </span>
                            </button>
                        </div>

                        {/* Widget Header Title */}
                        <div className="profile-field">
                            <label className="profile-field-label">Widget Header Title</label>
                            <input
                                type="text"
                                className="profile-field-input"
                                placeholder="e.g. Highlights & Spotlight"
                                value={widgetTitle}
                                onChange={(e) => setWidgetTitle(e.target.value)}
                            />
                        </div>

                        {/* Timer */}
                        <div className="profile-field">
                            <label className="profile-field-label">Slide Rotation Timer</label>
                            <select
                                className="profile-field-input"
                                value={slideInterval}
                                onChange={(e) => setSlideInterval(Number(e.target.value))}
                            >
                                <option value={3}>3 Seconds (Fast)</option>
                                <option value={5}>5 Seconds (Recommended)</option>
                                <option value={8}>8 Seconds (Normal)</option>
                                <option value={10}>10 Seconds (Slow)</option>
                                <option value={15}>15 Seconds (Very Slow)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Slide Cards List */}
                <div className="profile-card" style={{ marginTop: "24px" }}>
                    <div className="profile-section-header">
                        <div>
                            <h3 className="profile-section-title">📢 Advertisements & Highlight Slides ({slides.length})</h3>
                            <p className="askgpt-section-desc">
                                Customize content, theme colors, and target app actions for each desktop slide.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="profile-add-btn"
                            onClick={handleAddSlide}
                        >
                            + Add New Slide
                        </button>
                    </div>

                    {slides.length === 0 ? (
                        <p className="profile-empty">
                            No slides configured yet. Click "+ Add New Slide" above to create your first desktop highlight slide!
                        </p>
                    ) : (
                        <div className="widget-slides-admin-list">
                            {slides.map((slide, idx) => (
                                <div key={idx} className={`widget-slide-editor-card ${slide.isVisible === false ? "hidden-slide" : ""}`}>
                                    <div className="w-slide-card-header">
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span className="w-slide-badge-tag">Slide #{idx + 1}</span>
                                            {slide.isVisible === false && (
                                                <span className="w-slide-badge-hidden">👁️ Hidden</span>
                                            )}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            {/* Visibility toggle button */}
                                            <button
                                                type="button"
                                                className={`slide-vis-btn ${slide.isVisible !== false ? "active" : ""}`}
                                                onClick={() => handleSlideChange(idx, "isVisible", slide.isVisible === false ? true : false)}
                                            >
                                                {slide.isVisible !== false ? "👁️ Shown" : "🙈 Hidden"}
                                            </button>

                                            {/* Remove button */}
                                            <button
                                                type="button"
                                                className="profile-card-remove"
                                                style={{ position: "static" }}
                                                onClick={() => handleRemoveSlide(idx)}
                                                title="Delete Slide"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>

                                    <div className="profile-fields-grid" style={{ gridTemplateColumns: "80px 1fr 1fr", marginTop: "12px" }}>
                                        <div className="profile-field">
                                            <label className="profile-field-label">Icon</label>
                                            <input
                                                type="text"
                                                className="profile-field-input"
                                                placeholder="🚀"
                                                value={slide.icon || "🚀"}
                                                onChange={(e) => handleSlideChange(idx, "icon", e.target.value)}
                                            />
                                        </div>

                                        <div className="profile-field">
                                            <label className="profile-field-label">Badge Tag / Subtitle</label>
                                            <input
                                                type="text"
                                                className="profile-field-input"
                                                placeholder="e.g. Featured Project"
                                                value={slide.badge || ""}
                                                onChange={(e) => handleSlideChange(idx, "badge", e.target.value)}
                                            />
                                        </div>

                                        <div className="profile-field">
                                            <label className="profile-field-label">Color Theme</label>
                                            <select
                                                className="profile-field-input"
                                                value={slide.bgGradient || "blue"}
                                                onChange={(e) => handleSlideChange(idx, "bgGradient", e.target.value)}
                                            >
                                                <option value="blue">💙 Electric Blue</option>
                                                <option value="purple">💜 Cyber Purple</option>
                                                <option value="emerald">💚 Emerald Mint</option>
                                                <option value="amber">🧡 Amber Flare</option>
                                                <option value="rose">💖 Neon Rose</option>
                                                <option value="glass">🤍 Glass Translucent</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="profile-field" style={{ marginTop: "12px" }}>
                                        <label className="profile-field-label">Slide Title *</label>
                                        <input
                                            type="text"
                                            className="profile-field-input"
                                            placeholder="e.g. Full-Stack Engineer & AI Specialist"
                                            value={slide.title || ""}
                                            onChange={(e) => handleSlideChange(idx, "title", e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="profile-field" style={{ marginTop: "12px" }}>
                                        <label className="profile-field-label">Description / Praise Text ("Tarieef") *</label>
                                        <textarea
                                            className="askgpt-textarea"
                                            style={{ minHeight: "70px" }}
                                            placeholder="Write your highlight praise text here..."
                                            value={slide.description || ""}
                                            onChange={(e) => handleSlideChange(idx, "description", e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="profile-fields-grid" style={{ marginTop: "12px" }}>
                                        <div className="profile-field">
                                            <label className="profile-field-label">CTA Button Text</label>
                                            <input
                                                type="text"
                                                className="profile-field-input"
                                                placeholder="e.g. View Projects"
                                                value={slide.linkText || "Explore"}
                                                onChange={(e) => handleSlideChange(idx, "linkText", e.target.value)}
                                            />
                                        </div>

                                        <div className="profile-field">
                                            <label className="profile-field-label">Action App Target</label>
                                            <select
                                                className="profile-field-input"
                                                value={slide.linkApp || "project-manager"}
                                                onChange={(e) => handleSlideChange(idx, "linkApp", e.target.value)}
                                            >
                                                <option value="project-manager">Project Manager 🗂️</option>
                                                <option value="askgpt">AskGPT AI 🤖</option>
                                                <option value="profile">My Profile 👤</option>
                                                <option value="file-manager">File Manager 📁</option>
                                                <option value="music-player">Music Player 🎵</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="profile-save-bar" style={{ marginTop: "24px" }}>
                        <button
                            type="submit"
                            className="profile-save-btn"
                            disabled={saving}
                            style={{ width: "100%", justifyContent: "center" }}
                        >
                            {saving ? (
                                <>
                                    <span className="admin-login-spinner" />
                                    Saving Configuration...
                                </>
                            ) : (
                                <>💾 Save Desktop Sidebar Widget Settings</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default WidgetAdmin;
