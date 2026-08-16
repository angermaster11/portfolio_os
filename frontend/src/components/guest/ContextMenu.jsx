import { useState } from "react";

function ContextMenu({
    x,
    y,
    onRefresh,
    onClose,
    viewMode = "grid",
    onViewChange,
    sortOrder = "default",
    onSortChange,
    onOpenApp,
    onProperties,
    targetItem = null,
    onItemProperties
}) {
    const [activeSubmenu, setActiveSubmenu] = useState(null);

    // Adjust position to stay inside viewport
    const adjustedX = Math.min(x, window.innerWidth - 220);
    const adjustedY = Math.min(y, window.innerHeight - 320);

    const appsList = [
        { id: "portfolio-showcase", title: "Portfolio Showcase", icon: "✨", width: 950, height: 620 },
        { id: "project-manager", title: "Project Manager", icon: "🗂️", width: 900, height: 600 },
        { id: "file-manager", title: "File Manager", icon: "📁", width: 850, height: 550 },
        { id: "profile", title: "My Profile", icon: "👤", width: 700, height: 550 },
        { id: "askgpt", title: "AskGPT AI", icon: "🤖", width: 850, height: 580 },
        { id: "music-player", title: "Music Player", icon: "🎵", width: 850, height: 560 },
        { id: "about", title: "About System", icon: "ℹ️", width: 450, height: 420 }
    ];

    if (targetItem) {
        // Icon-specific Right Click Context Menu
        return (
            <div
                className="context-menu"
                style={{ left: adjustedX, top: adjustedY }}
                onClick={e => e.stopPropagation()}
            >
                <div className="context-menu-header">
                    <span className="context-menu-header-icon">{targetItem.icon}</span>
                    <span className="context-menu-header-title">{targetItem.title}</span>
                </div>

                <div className="context-menu-divider" />

                <button
                    className="context-menu-item primary"
                    onClick={() => {
                        onClose();
                        if (onOpenApp) onOpenApp(targetItem);
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Open Application</span>
                </button>

                <button
                    className="context-menu-item"
                    onClick={() => {
                        onClose();
                        if (onItemProperties) onItemProperties(targetItem);
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>App Properties</span>
                </button>

                <div className="context-menu-divider" />

                <button
                    className="context-menu-item"
                    onClick={() => {
                        onClose();
                        if (onRefresh) onRefresh();
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 4v6h-6" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    <span>Refresh Desktop</span>
                </button>
            </div>
        );
    }

    // General Desktop Right Click Context Menu
    return (
        <div
            className="context-menu"
            style={{ left: adjustedX, top: adjustedY }}
            onClick={e => e.stopPropagation()}
        >
            {/* Refresh */}
            <button
                className="context-menu-item"
                onClick={() => {
                    onClose();
                    if (onRefresh) onRefresh();
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>Refresh</span>
            </button>

            <div className="context-menu-divider" />

            {/* View Submenu */}
            <div
                className="context-menu-group"
                onMouseEnter={() => setActiveSubmenu("view")}
                onMouseLeave={() => setActiveSubmenu(null)}
            >
                <div className="context-menu-item has-submenu">
                    <div className="flex-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                        </svg>
                        <span>View Mode</span>
                    </div>
                    <span className="submenu-arrow">▶</span>
                </div>

                {activeSubmenu === "view" && (
                    <div className="context-submenu">
                        <button
                            className={`context-menu-item ${viewMode === "grid" ? "selected" : ""}`}
                            onClick={() => {
                                onViewChange("grid");
                                onClose();
                            }}
                        >
                            <span className="check-mark">{viewMode === "grid" ? "✓" : ""}</span>
                            <span>Grid View</span>
                        </button>
                        <button
                            className={`context-menu-item ${viewMode === "list" ? "selected" : ""}`}
                            onClick={() => {
                                onViewChange("list");
                                onClose();
                            }}
                        >
                            <span className="check-mark">{viewMode === "list" ? "✓" : ""}</span>
                            <span>List View</span>
                        </button>
                        <button
                            className={`context-menu-item ${viewMode === "large" ? "selected" : ""}`}
                            onClick={() => {
                                onViewChange("large");
                                onClose();
                            }}
                        >
                            <span className="check-mark">{viewMode === "large" ? "✓" : ""}</span>
                            <span>Large Icons</span>
                        </button>
                        <button
                            className={`context-menu-item ${viewMode === "small" ? "selected" : ""}`}
                            onClick={() => {
                                onViewChange("small");
                                onClose();
                            }}
                        >
                            <span className="check-mark">{viewMode === "small" ? "✓" : ""}</span>
                            <span>Small Icons</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Sort by Submenu */}
            <div
                className="context-menu-group"
                onMouseEnter={() => setActiveSubmenu("sort")}
                onMouseLeave={() => setActiveSubmenu(null)}
            >
                <div className="context-menu-item has-submenu">
                    <div className="flex-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                        <span>Sort by</span>
                    </div>
                    <span className="submenu-arrow">▶</span>
                </div>

                {activeSubmenu === "sort" && (
                    <div className="context-submenu">
                        <button
                            className={`context-menu-item ${sortOrder === "name" ? "selected" : ""}`}
                            onClick={() => {
                                onSortChange("name");
                                onClose();
                            }}
                        >
                            <span className="check-mark">{sortOrder === "name" ? "✓" : ""}</span>
                            <span>Name (A-Z)</span>
                        </button>
                        <button
                            className={`context-menu-item ${sortOrder === "type" ? "selected" : ""}`}
                            onClick={() => {
                                onSortChange("type");
                                onClose();
                            }}
                        >
                            <span className="check-mark">{sortOrder === "type" ? "✓" : ""}</span>
                            <span>Category / Type</span>
                        </button>
                        <button
                            className={`context-menu-item ${sortOrder === "default" ? "selected" : ""}`}
                            onClick={() => {
                                onSortChange("default");
                                onClose();
                            }}
                        >
                            <span className="check-mark">{sortOrder === "default" ? "✓" : ""}</span>
                            <span>Default Position</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="context-menu-divider" />

            {/* Launch App Submenu */}
            <div
                className="context-menu-group"
                onMouseEnter={() => setActiveSubmenu("open")}
                onMouseLeave={() => setActiveSubmenu(null)}
            >
                <div className="context-menu-item has-submenu">
                    <div className="flex-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Launch App</span>
                    </div>
                    <span className="submenu-arrow">▶</span>
                </div>

                {activeSubmenu === "open" && (
                    <div className="context-submenu">
                        {appsList.map(app => (
                            <button
                                key={app.id}
                                className="context-menu-item"
                                onClick={() => {
                                    onClose();
                                    if (onOpenApp) onOpenApp(app);
                                }}
                            >
                                <span>{app.icon}</span>
                                <span>{app.title}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="context-menu-divider" />

            {/* Properties */}
            <button
                className="context-menu-item"
                onClick={() => {
                    onClose();
                    if (onProperties) onProperties();
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Properties & Specs</span>
            </button>
        </div>
    );
}

export default ContextMenu;
