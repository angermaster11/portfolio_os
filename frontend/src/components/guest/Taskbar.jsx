import { useState, useEffect } from "react";
import StartMenu from "./StartMenu";
import Calendar from "./Calendar";
import { useAudio } from "../../context/AudioContext";

function Taskbar({ windows, activeWindowId, onWindowClick, onOpenApp, onShutdown }) {
    const { currentTrack, isPlaying, togglePlay } = useAudio();
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");
    const [showStart, setShowStart] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }));
            setDate(now.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }));
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleStartClick = () => {
        setShowStart(prev => !prev);
        setShowCalendar(false);
    };

    const handleCalendarClick = () => {
        setShowCalendar(prev => !prev);
        setShowStart(false);
    };

    const handleAppOpen = (app) => {
        onOpenApp(app);
        setShowStart(false);
    };

    return (
        <>
            {showStart && (
                <StartMenu
                    onClose={() => setShowStart(false)}
                    onOpenApp={handleAppOpen}
                    onShutdown={onShutdown}
                />
            )}

            {showCalendar && (
                <Calendar onClose={() => setShowCalendar(false)} />
            )}

            <div className="taskbar">
                {/* Start button */}
                <button
                    className={`taskbar-start ${showStart ? "active" : ""}`}
                    onClick={handleStartClick}
                    title="Start"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="2" width="9" height="9" rx="1" />
                        <rect x="13" y="2" width="9" height="9" rx="1" />
                        <rect x="2" y="13" width="9" height="9" rx="1" />
                        <rect x="13" y="13" width="9" height="9" rx="1" />
                    </svg>
                </button>

                {/* Window tabs */}
                <div className="taskbar-windows">
                    {windows.map(win => (
                        <button
                            key={win.id}
                            className={`taskbar-window-tab ${
                                activeWindowId === win.id && !win.minimized ? "active" : ""
                            }`}
                            onClick={() => onWindowClick(win.id)}
                            title={win.title}
                        >
                            <span className="taskbar-tab-icon">{win.icon}</span>
                            <span className="taskbar-tab-title">{win.title}</span>
                        </button>
                    ))}
                </div>

                {/* System tray */}
                <div className="taskbar-tray">
                    {/* Background Music Widget */}
                    {currentTrack && (
                        <div
                            className="taskbar-music-widget"
                            onClick={() => onOpenApp({ id: "music-player", title: "Music Player", icon: "🎵", width: 850, height: 560 })}
                            title={`Now Playing: ${currentTrack.title}`}
                        >
                            <span>🎵</span>
                            <span className="tb-m-title">{currentTrack.title}</span>
                            <button
                                type="button"
                                className="tb-m-play-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePlay();
                                }}
                            >
                                {isPlaying ? "⏸" : "▶"}
                            </button>
                        </div>
                    )}

                    {/* Network */}
                    <div className="taskbar-tray-icon" title="Connected">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13a10 10 0 0 1 14 0" />
                            <path d="M8.5 16a5 5 0 0 1 7 0" />
                            <circle cx="12" cy="19" r="1" fill="currentColor" />
                        </svg>
                    </div>

                    {/* Volume */}
                    <div className="taskbar-tray-icon" title="Volume">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                        </svg>
                    </div>

                    {/* Shutdown button directly in tray */}
                    <button
                        className="taskbar-tray-icon taskbar-power-btn"
                        title="Shut Down"
                        onClick={onShutdown}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f38ba8" strokeWidth="2">
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                            <line x1="12" y1="2" x2="12" y2="12" />
                        </svg>
                    </button>

                    {/* Divider */}
                    <div className="taskbar-tray-divider" />

                    {/* Clock */}
                    <button
                        className="taskbar-clock"
                        onClick={handleCalendarClick}
                    >
                        <span className="taskbar-time">{time}</span>
                        <span className="taskbar-date">{date}</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default Taskbar;
