import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, apiDelete } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { useAudio } from "../../context/AudioContext";

function MusicAdmin() {
    const { token } = useAuth();
    const { loadTracks } = useAudio();

    const [musicList, setMusicList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);

    // Form states
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("Arju");
    const [album, setAlbum] = useState("Single");
    const [audioFile, setAudioFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    const audioInputRef = useRef(null);
    const coverInputRef = useRef(null);

    useEffect(() => {
        fetchMusic();
    }, []);

    const fetchMusic = async () => {
        try {
            const res = await apiGet("/music");
            if (res.data) {
                setMusicList(res.data);
            }
        } catch (err) {
            console.error("Failed to load music list:", err);
            showToast("Failed to load tracks from server", "error");
        }
        setLoading(false);
    };

    const showToast = (text, type = "success") => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleAudioChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioFile(file);
            if (!title) {
                // Auto-fill title from filename
                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                setTitle(nameWithoutExt);
            }
        }
    };

    const handleUploadTrack = async (e) => {
        e.preventDefault();
        if (!audioFile) {
            showToast("Please select an audio file to upload", "error");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("audio", audioFile);
            if (coverFile) formData.append("cover", coverFile);
            formData.append("title", title);
            formData.append("artist", artist);
            formData.append("album", album);

            const res = await apiPost("/music", formData);

            if (res.success) {
                showToast(`Uploaded "${res.data.title}" successfully! 🎵`, "success");
                // Reset form
                setTitle("");
                setAudioFile(null);
                setCoverFile(null);
                setCoverPreview(null);
                if (audioInputRef.current) audioInputRef.current.value = "";
                if (coverInputRef.current) coverInputRef.current.value = "";

                await fetchMusic();
                loadTracks(); // Refresh global player
            } else {
                showToast(res.error || res.message || "Failed to upload track", "error");
            }
        } catch (err) {
            console.error("Music upload error:", err);
            showToast(err.message || "Error uploading music file", "error");
        }
        setUploading(false);
    };

    const handleDeleteTrack = async (id, trackTitle) => {
        if (!window.confirm(`Are you sure you want to delete track "${trackTitle}"?`)) return;

        try {
            const res = await apiDelete(`/music/${id}`, token);
            if (res.success) {
                showToast(`Deleted "${trackTitle}"`, "success");
                setMusicList(prev => prev.filter(m => m._id !== id));
                loadTracks(); // Refresh global player
            } else {
                showToast(res.error || "Failed to delete track", "error");
            }
        } catch (err) {
            showToast("Error deleting track", "error");
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const formatTime = (secs) => {
        if (!secs) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <span className="admin-login-spinner" />
                <p>Loading Music Library...</p>
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

            {/* 1. Upload Music Section */}
            <div className="profile-card">
                <h3 className="profile-section-title">🎵 Upload Track to Music Library</h3>
                <p className="askgpt-section-desc">
                    Upload audio files (.mp3, .wav, .ogg, .m4a) and cover art. These songs will be available in the Desktop Music Player & background audio system.
                </p>

                <form onSubmit={handleUploadTrack} className="music-upload-form">
                    <div className="music-form-grid">
                        {/* Cover Art Upload Box */}
                        <div className="music-cover-upload" onClick={() => coverInputRef.current?.click()}>
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover Preview" className="cover-img-preview" />
                            ) : (
                                <div className="cover-placeholder">
                                    <span style={{ fontSize: "32px" }}>🖼️</span>
                                    <span>Upload Cover Art</span>
                                    <span style={{ fontSize: "11px", color: "#6b7280" }}>(Optional PNG/JPG)</span>
                                </div>
                            )}
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                style={{ display: "none" }}
                            />
                        </div>

                        {/* Details Grid */}
                        <div className="music-fields-container">
                            <div className="profile-field">
                                <label className="profile-field-label">Track Title *</label>
                                <input
                                    type="text"
                                    className="profile-field-input"
                                    placeholder="e.g. Lofi Coding Beats"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="profile-fields-grid" style={{ marginTop: "12px" }}>
                                <div className="profile-field">
                                    <label className="profile-field-label">Artist Name</label>
                                    <input
                                        type="text"
                                        className="profile-field-input"
                                        placeholder="Arju"
                                        value={artist}
                                        onChange={(e) => setArtist(e.target.value)}
                                    />
                                </div>

                                <div className="profile-field">
                                    <label className="profile-field-label">Album / Collection</label>
                                    <input
                                        type="text"
                                        className="profile-field-input"
                                        placeholder="Portfolio Beats"
                                        value={album}
                                        onChange={(e) => setAlbum(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Audio File Selection */}
                            <div className="profile-field" style={{ marginTop: "12px" }}>
                                <label className="profile-field-label">Audio File (.mp3, .wav, .m4a, .ogg) *</label>
                                <div className="audio-file-selector" onClick={() => audioInputRef.current?.click()}>
                                    <span>🎵 {audioFile ? audioFile.name : "Choose audio file..."}</span>
                                    <button type="button" className="profile-add-btn" style={{ margin: 0 }}>Browse</button>
                                </div>
                                <input
                                    ref={audioInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleAudioChange}
                                    style={{ display: "none" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="profile-save-bar" style={{ marginTop: "20px" }}>
                        <button
                            type="submit"
                            className="profile-save-btn"
                            disabled={uploading}
                            style={{ width: "100%", justifyContent: "center" }}
                        >
                            {uploading ? (
                                <>
                                    <span className="admin-login-spinner" />
                                    Uploading Audio Track...
                                </>
                            ) : (
                                <>⬆️ Upload Track to Player</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* 2. Songs Library Grid */}
            <div className="profile-card" style={{ marginTop: "24px" }}>
                <div className="profile-section-header">
                    <div>
                        <h3 className="profile-section-title">🎧 Uploaded Music Tracks ({musicList.length})</h3>
                        <p className="askgpt-section-desc">
                            All tracks present in your portfolio audio library.
                        </p>
                    </div>
                </div>

                {musicList.length === 0 ? (
                    <p className="profile-empty">
                        No custom tracks uploaded yet. The desktop app is currently using demo sample tracks. Upload a song above!
                    </p>
                ) : (
                    <div className="music-admin-list">
                        {musicList.map((track) => (
                            <div key={track._id} className="music-admin-item">
                                <div className="m-cover">
                                    {track.coverUrl ? (
                                        <img src={track.coverUrl} alt={track.title} />
                                    ) : (
                                        <div className="m-cover-fallback">🎵</div>
                                    )}
                                </div>
                                <div className="m-info">
                                    <div className="m-title">{track.title}</div>
                                    <div className="m-artist">{track.artist} • {track.album}</div>
                                    <div className="m-meta">{formatBytes(track.fileSize)} • {new Date(track.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="m-actions">
                                    <button
                                        type="button"
                                        className="profile-card-remove"
                                        style={{ position: "static" }}
                                        onClick={() => handleDeleteTrack(track._id, track.title)}
                                        title="Delete track"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MusicAdmin;
