import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileManager from "./ProfileManager";
import ProjectTree from "./ProjectTree";
import AskGPTAdmin from "./AskGPTAdmin";
import MusicAdmin from "./MusicAdmin";
import WidgetAdmin from "./WidgetAdmin";
import PresentationAdmin from "./PresentationAdmin";
import "./admin.css";

function AdminPanel({ onLogout }) {
    const [activeModule, setActiveModule] = useState("profile");
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        onLogout();
    };

    return (
        <div className="admin-panel">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-sidebar-logo">
                        <span className="admin-logo-icon">☸</span>
                        <div>
                            <span className="admin-logo-text">Portfolio</span>
                            <span className="admin-logo-sub">Admin Panel</span>
                        </div>
                    </div>
                </div>

                <nav className="admin-sidebar-nav">
                    <span className="admin-nav-section">Modules</span>

                    <button
                        className={`admin-nav-item ${
                            activeModule === "profile" ? "active" : ""
                        }`}
                        onClick={() => setActiveModule("profile")}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M5 20c.8-3.8 3.5-6 7-6s6.2 2.2 7 6" />
                        </svg>
                        <span>Profile</span>
                    </button>

                    <button
                        className={`admin-nav-item ${
                            activeModule === "projects" ? "active" : ""
                        }`}
                        onClick={() => setActiveModule("projects")}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Projects</span>
                    </button>

                    <button
                        className={`admin-nav-item ${
                            activeModule === "askgpt" ? "active" : ""
                        }`}
                        onClick={() => setActiveModule("askgpt")}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                            <path d="M4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7z" />
                            <circle cx="9" cy="14" r="1" />
                            <circle cx="15" cy="14" r="1" />
                        </svg>
                        <span>AskGPT AI</span>
                    </button>

                    <button
                        className={`admin-nav-item ${
                            activeModule === "music" ? "active" : ""
                        }`}
                        onClick={() => setActiveModule("music")}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                        </svg>
                        <span>Music Player 🎵</span>
                    </button>

                    <button
                        className={`admin-nav-item ${
                            activeModule === "widgets" ? "active" : ""
                        }`}
                        onClick={() => setActiveModule("widgets")}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18" />
                            <path d="M9 21V9" />
                        </svg>
                        <span>Sidebar Widget 📢</span>
                    </button>

                    <button
                        className={`admin-nav-item ${
                            activeModule === "presentation" ? "active" : ""
                        }`}
                        onClick={() => setActiveModule("presentation")}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        <span>Presentation PPT 📊</span>
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-user-avatar">
                            {(user?.username || "A")[0].toUpperCase()}
                        </div>
                        <div>
                            <span className="admin-user-name">
                                {user?.username || "Admin"}
                            </span>
                            <span className="admin-user-role">
                                Administrator
                            </span>
                        </div>
                    </div>

                    <button
                        className="admin-logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1 className="admin-header-title">
                            {activeModule === "profile"
                                ? "Profile Manager"
                                : activeModule === "projects"
                                ? "Project Files"
                                : activeModule === "askgpt"
                                ? "AskGPT RAG Settings"
                                : activeModule === "music"
                                ? "Music Library Manager"
                                : activeModule === "widgets"
                                ? "Desktop Highlights Sidebar Widget"
                                : "Interactive Presentation PPT Deck"}
                        </h1>
                        <p className="admin-header-subtitle">
                            {activeModule === "profile"
                                ? "Manage your portfolio profile information"
                                : activeModule === "projects"
                                ? "Organize your projects in a file tree structure"
                                : activeModule === "askgpt"
                                ? "Configure system prompt & upload knowledge base documents for AskGPT AI"
                                : activeModule === "music"
                                ? "Upload audio tracks & cover art for the portfolio music player"
                                : activeModule === "widgets"
                                ? "Manage desktop right sidebar promotional cards & carousel rotation timer"
                                : "Create slides, upload banners, select themes, and manage your portfolio presentation PPT"}
                        </p>
                    </div>
                </header>

                <div className="admin-content">
                    {activeModule === "profile" && <ProfileManager />}
                    {activeModule === "projects" && <ProjectTree />}
                    {activeModule === "askgpt" && <AskGPTAdmin />}
                    {activeModule === "music" && <MusicAdmin />}
                    {activeModule === "widgets" && <WidgetAdmin />}
                    {activeModule === "presentation" && <PresentationAdmin />}
                </div>
            </main>
        </div>
    );
}

export default AdminPanel;
