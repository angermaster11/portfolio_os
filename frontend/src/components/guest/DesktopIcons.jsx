const INITIAL_DESKTOP_ICONS = [
    { id: "portfolio-showcase", title: "Portfolio Showcase", icon: "✨", width: 950, height: 620, category: "user" },
    { id: "project-manager", title: "Project Manager", icon: "🗂️", width: 900, height: 600, category: "work" },
    { id: "file-manager", title: "File Manager", icon: "📁", width: 850, height: 550, category: "system" },
    { id: "profile", title: "My Profile", icon: "👤", width: 700, height: 550, category: "user" },
    { id: "askgpt", title: "AskGPT AI", icon: "🤖", width: 850, height: 580, category: "ai" },
    { id: "music-player", title: "Music Player", icon: "🎵", width: 850, height: 560, category: "media" },
    { id: "about", title: "About", icon: "ℹ️", width: 450, height: 420, category: "system" }
];

function DesktopIcons({ icons = INITIAL_DESKTOP_ICONS, onOpen, viewMode = "grid", onIconContextMenu }) {
    return (
        <div className={`desktop-icons view-mode-${viewMode}`}>
            {icons.map(app => (
                <button
                    key={app.id}
                    className={`desktop-icon icon-size-${viewMode}`}
                    onDoubleClick={() => onOpen(app)}
                    onContextMenu={(e) => {
                        if (onIconContextMenu) {
                            e.preventDefault();
                            e.stopPropagation();
                            onIconContextMenu(e, app);
                        }
                    }}
                >
                    <span className="desktop-icon-img">{app.icon}</span>
                    <span className="desktop-icon-label">{app.title}</span>
                </button>
            ))}
        </div>
    );
}

export { INITIAL_DESKTOP_ICONS };
export default DesktopIcons;

