const APPS = [
    { id: "portfolio-showcase", title: "Portfolio Showcase", icon: "✨", width: 950, height: 620 },
    { id: "project-manager", title: "Project Manager", icon: "🗂️", width: 900, height: 600 },
    { id: "file-manager", title: "File Manager", icon: "📁", width: 850, height: 550 },
    { id: "profile", title: "My Profile", icon: "👤", width: 700, height: 550 },
    { id: "askgpt", title: "AskGPT AI", icon: "🤖", width: 850, height: 580 },
    { id: "music-player", title: "Music Player", icon: "🎵", width: 850, height: 560 },
    { id: "about", title: "About", icon: "ℹ️", width: 450, height: 420 }
];

function StartMenu({ onClose, onOpenApp, onShutdown }) {
    return (
        <div className="start-menu-overlay" onClick={onClose}>
            <div
                className="start-menu"
                onClick={e => e.stopPropagation()}
            >
                {/* User section */}
                <div className="start-menu-user">
                    <div className="start-menu-avatar">A</div>
                    <div>
                        <span className="start-menu-username">Arju Srivastava</span>
                        <span className="start-menu-role">Portfolio OS</span>
                    </div>
                </div>

                {/* Search */}
                <div className="start-menu-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search apps..."
                        className="start-menu-search-input"
                    />
                </div>

                {/* Pinned Apps */}
                <div className="start-menu-section">
                    <span className="start-menu-section-label">Pinned Apps</span>
                    <div className="start-menu-apps">
                        {APPS.map(app => (
                            <button
                                key={app.id}
                                className="start-menu-app"
                                onClick={() => onOpenApp(app)}
                            >
                                <span className="start-menu-app-icon">{app.icon}</span>
                                <span className="start-menu-app-name">{app.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer with Shutdown option */}
                <div className="start-menu-footer">
                    <span className="start-menu-footer-text">Portfolio OS v1.0.0</span>
                    <button
                        className="start-menu-shutdown-btn"
                        onClick={() => {
                            onClose();
                            onShutdown();
                        }}
                        title="Shut Down OS"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                            <line x1="12" y1="2" x2="12" y2="12" />
                        </svg>
                        Shut Down
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StartMenu;
