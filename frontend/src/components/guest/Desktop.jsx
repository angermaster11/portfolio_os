import { useState, useCallback, useEffect } from "react";
import Taskbar from "./Taskbar";
import DesktopIcons, { INITIAL_DESKTOP_ICONS } from "./DesktopIcons";
import ContextMenu from "./ContextMenu";
import Window from "./Window";
import FileManager from "./FileManager";
import ProfileViewer from "./ProfileViewer";
import ProjectManager from "./ProjectManager";
import AskGPT from "./AskGPT";
import MusicPlayer from "./MusicPlayer";
import PortfolioShowcase from "./PortfolioShowcase";
import WidgetSidebar from "./WidgetSidebar";
import FullscreenPrompt from "./FullscreenPrompt";
import "./guest.css";

function Desktop({ onBack }) {
    const [windows, setWindows] = useState([]);
    const [activeWindowId, setActiveWindowId] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [nextZIndex, setNextZIndex] = useState(100);
    const [shuttingDown, setShuttingDown] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Fullscreen prompt state
    const [showFsPrompt, setShowFsPrompt] = useState(true);

    // Context Menu States: View Mode & Sort Order
    const [viewMode, setViewMode] = useState("grid");
    const [sortOrder, setSortOrder] = useState("default");
    const [propertiesModal, setPropertiesModal] = useState(null);

    const openWindow = useCallback((app) => {
        const existing = windows.find(w => w.app === app.id);
        if (existing) {
            setActiveWindowId(existing.id);
            setWindows(prev => prev.map(w =>
                w.id === existing.id ? { ...w, minimized: false } : w
            ));
            return;
        }

        const id = `win-${Date.now()}`;
        const newWindow = {
            id,
            app: app.id,
            title: app.title,
            icon: app.icon,
            x: 80 + (windows.length * 30) % 200,
            y: 50 + (windows.length * 30) % 150,
            width: app.width || 800,
            height: app.height || 520,
            minimized: false,
            maximized: false,
            zIndex: nextZIndex
        };

        setWindows(prev => [...prev, newWindow]);
        setActiveWindowId(id);
        setNextZIndex(prev => prev + 1);
    }, [windows, nextZIndex]);

    const closeWindow = useCallback((id) => {
        setWindows(prev => prev.filter(w => w.id !== id));
        if (activeWindowId === id) setActiveWindowId(null);
    }, [activeWindowId]);

    const minimizeWindow = useCallback((id) => {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, minimized: true } : w
        ));
        if (activeWindowId === id) setActiveWindowId(null);
    }, [activeWindowId]);

    const maximizeWindow = useCallback((id) => {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, maximized: !w.maximized } : w
        ));
    }, []);

    const focusWindow = useCallback((id) => {
        setActiveWindowId(id);
        setNextZIndex(prev => {
            setWindows(ws => ws.map(w =>
                w.id === id ? { ...w, zIndex: prev, minimized: false } : w
            ));
            return prev + 1;
        });
    }, []);

    const moveWindow = useCallback((id, x, y) => {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, x, y } : w
        ));
    }, []);

    const resizeWindow = useCallback((id, width, height) => {
        setWindows(prev => prev.map(w =>
            w.id === id ? { ...w, width, height } : w
        ));
    }, []);

    // Right Click Context Menu Triggers
    const handleDesktopContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, targetItem: null });
    };

    const handleIconContextMenu = (e, iconItem) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, targetItem: iconItem });
    };

    const closeContextMenu = () => setContextMenu(null);

    const handleRefresh = () => {
        closeContextMenu();
        setRefreshing(true);
        setRefreshKey(prev => prev + 1);
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    };

    const handleShutdown = () => {
        setShuttingDown(true);
        setTimeout(() => {
            if (onBack) onBack();
        }, 2200);
    };

    useEffect(() => {
        const handler = () => closeContextMenu();
        window.addEventListener("click", handler);
        return () => window.removeEventListener("click", handler);
    }, []);

    // Dynamically calculate sorted icons
    const getSortedIcons = () => {
        const icons = [...INITIAL_DESKTOP_ICONS];
        if (sortOrder === "name") {
            return icons.sort((a, b) => a.title.localeCompare(b.title));
        }
        if (sortOrder === "type") {
            return icons.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
        }
        return icons;
    };

    const getWindowContent = (app) => {
        switch (app) {
            case "project-manager":
                return <ProjectManager key={refreshKey} />;
            case "file-manager":
                return <FileManager key={refreshKey} />;
            case "profile":
                return <ProfileViewer key={refreshKey} />;
            case "askgpt":
                return <AskGPT key={refreshKey} />;
            case "music-player":
                return <MusicPlayer key={refreshKey} />;
            case "portfolio-showcase":
                return <PortfolioShowcase key={refreshKey} onOpenApp={openWindow} />;
            case "about":
                return <AboutContent />;
            default:
                return <div className="win-placeholder">Content for {app}</div>;
        }
    };

    return (
        <div className="desktop" onContextMenu={handleDesktopContextMenu}>
            {/* Fullscreen Modal Prompt on load */}
            {showFsPrompt && (
                <FullscreenPrompt onClose={() => setShowFsPrompt(false)} />
            )}

            {/* Shutdown Overlay Screen */}
            {shuttingDown && (
                <div className="shutdown-screen">
                    <div className="shutdown-content">
                        <div className="shutdown-spinner" />
                        <h2 className="shutdown-title">Shutting down Portfolio OS...</h2>
                        <p className="shutdown-sub">Saving system state & returning to mode select</p>
                    </div>
                </div>
            )}

            <div className={`desktop-area ${refreshing ? "desktop-refresh" : ""}`} onClick={closeContextMenu}>
                {/* Right Side Highlights Advertisement Widget */}
                <WidgetSidebar onOpenApp={openWindow} />

                <DesktopIcons
                    icons={getSortedIcons()}
                    onOpen={openWindow}
                    viewMode={viewMode}
                    onIconContextMenu={handleIconContextMenu}
                />

                {windows.map(win => (
                    <Window
                        key={win.id}
                        {...win}
                        isActive={activeWindowId === win.id}
                        onClose={() => closeWindow(win.id)}
                        onMinimize={() => minimizeWindow(win.id)}
                        onMaximize={() => maximizeWindow(win.id)}
                        onFocus={() => focusWindow(win.id)}
                        onMove={(x, y) => moveWindow(win.id, x, y)}
                        onResize={(w, h) => resizeWindow(win.id, w, h)}
                    >
                        {getWindowContent(win.app)}
                    </Window>
                ))}
            </div>

            {/* Executable Right-Click Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    targetItem={contextMenu.targetItem}
                    onRefresh={handleRefresh}
                    onClose={closeContextMenu}
                    viewMode={viewMode}
                    onViewChange={(mode) => setViewMode(mode)}
                    sortOrder={sortOrder}
                    onSortChange={(sort) => setSortOrder(sort)}
                    onOpenApp={(app) => openWindow(app)}
                    onProperties={() => setPropertiesModal({ type: "system" })}
                    onItemProperties={(item) => setPropertiesModal({ type: "item", item })}
                />
            )}

            {/* Properties & Specs Modal */}
            {propertiesModal && (
                <div className="properties-modal-overlay" onClick={() => setPropertiesModal(null)}>
                    <div className="properties-modal" onClick={e => e.stopPropagation()}>
                        <div className="properties-header">
                            <h3>
                                {propertiesModal.type === "item"
                                    ? `${propertiesModal.item.icon} ${propertiesModal.item.title} Properties`
                                    : "🖥️ Portfolio OS System Properties"}
                            </h3>
                            <button className="properties-close" onClick={() => setPropertiesModal(null)}>✕</button>
                        </div>
                        <div className="properties-body">
                            {propertiesModal.type === "item" ? (
                                <div className="properties-list">
                                    <div className="properties-row">
                                        <span className="prop-label">Application Name:</span>
                                        <span className="prop-val">{propertiesModal.item.title}</span>
                                    </div>
                                    <div className="properties-row">
                                        <span className="prop-label">App Identifier:</span>
                                        <span className="prop-val">{propertiesModal.item.id}</span>
                                    </div>
                                    <div className="properties-row">
                                        <span className="prop-label">Category:</span>
                                        <span className="prop-val">{propertiesModal.item.category || "System"}</span>
                                    </div>
                                    <div className="properties-row">
                                        <span className="prop-label">Default Window Size:</span>
                                        <span className="prop-val">{propertiesModal.item.width} x {propertiesModal.item.height} px</span>
                                    </div>
                                    <div className="properties-row">
                                        <span className="prop-label">Status:</span>
                                        <span className="prop-val text-green">Executable & Active</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="properties-list">
                                    <div className="properties-row">
                                        <span className="prop-label">OS Name:</span>
                                        <span className="prop-val">Portfolio OS (Dual-Mode Edition)</span>
                                    </div>
                                    <div className="properties-row">
                                        <span className="prop-label">Version:</span>
                                        <span className="prop-val">1.0.0 (Build 2026.08)</span>
                                    </div>
                                    <div className="properties-row">
                                        <span className="prop-label">Display Resolution:</span>
                                        <span className="prop-val">{window.innerWidth} x {window.innerHeight} px</span>
                                    </div>
                                    <div className="properties-row">
                                        <span className="prop-label">Desktop View Mode:</span>
                                        <span className="prop-val uppercase">{viewMode} View</span>
                                    </div>
                                    <div className="properties-row">
                                        <span className="prop-label">Icon Sort Order:</span>
                                        <span className="prop-val capitalize">{sortOrder}</span>
                                    </div>
                                    <div className="properties-row">
                                        <span className="prop-label">Active Windows:</span>
                                        <span className="prop-val">{windows.length} running</span>
                                    </div>
                                    <div className="properties-row">
                                        <span className="prop-label">Environment:</span>
                                        <span className="prop-val">React + Express + MongoDB</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="properties-footer">
                            <button className="properties-ok-btn" onClick={() => setPropertiesModal(null)}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            <Taskbar
                windows={windows}
                activeWindowId={activeWindowId}
                onWindowClick={focusWindow}
                onOpenApp={openWindow}
                onShutdown={handleShutdown}
            />
        </div>
    );
}

function AboutContent() {
    return (
        <div className="about-content">
            <div className="about-logo">☸</div>
            <h2>Portfolio OS</h2>
            <p className="about-version">Version 1.0.0</p>
            <div className="about-divider" />
            <p className="about-desc">
                A personal portfolio designed as an operating system experience.
                Built with React, Express, and MongoDB.
            </p>
            <div className="about-info">
                <div className="about-info-row">
                    <span>Developer</span>
                    <span>Arju Srivastava</span>
                </div>
                <div className="about-info-row">
                    <span>Framework</span>
                    <span>React + Vite</span>
                </div>
                <div className="about-info-row">
                    <span>Backend</span>
                    <span>Express + MongoDB</span>
                </div>
            </div>
        </div>
    );
}

export default Desktop;
