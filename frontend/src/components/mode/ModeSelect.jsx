import { useEffect, useState } from "react";

function StatusBar() {
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");
    const [battery, setBattery] = useState(null);
    const [charging, setCharging] = useState(false);
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }));
            setDate(now.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let bm;
        const update = () => { if (!bm) return; setBattery(Math.round(bm.level * 100)); setCharging(bm.charging); };
        const init = async () => {
            if (!navigator.getBattery) return;
            bm = await navigator.getBattery();
            update();
            bm.addEventListener("levelchange", update);
            bm.addEventListener("chargingchange", update);
        };
        init();
        return () => { if (bm) { bm.removeEventListener("levelchange", update); bm.removeEventListener("chargingchange", update); } };
    }, []);

    useEffect(() => {
        const on = () => setOnline(true);
        const off = () => setOnline(false);
        window.addEventListener("online", on);
        window.addEventListener("offline", off);
        return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
    }, []);

    return (
        <header className="ms-statusbar">
            <div className="ms-statusbar-left">
                <div className="ms-logo-ring">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                    </svg>
                </div>
                <span className="ms-brand-name">PORTFOLIO OS</span>
                <span className="ms-version">v1.0.0</span>
            </div>

            <div className="ms-statusbar-right">
                <div className="ms-status-icon" title={online ? "Online" : "Offline"}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: online ? 1 : 0.3 }}>
                        <path d="M5 13a10 10 0 0 1 14 0"/>
                        <path d="M8.5 16a5 5 0 0 1 7 0"/>
                        <path d="M12 19h.01"/>
                    </svg>
                </div>

                <div className="ms-status-icon" title="Audio">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                        <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
                    </svg>
                </div>

                {battery !== null && (
                    <div className="ms-battery" title={`${battery}%${charging ? " · Charging" : ""}`}>
                        <div className="ms-battery-bar">
                            <div className="ms-battery-fill" style={{ width: `${battery}%`, background: battery < 20 ? "#ef4444" : battery < 50 ? "#f59e0b" : "#4ade80" }} />
                            <div className="ms-battery-tip" />
                        </div>
                        <span className="ms-battery-pct">{battery}%</span>
                    </div>
                )}

                <div className="ms-statusbar-divider" />
                <span className="ms-time">{time}</span>
                <span className="ms-date">{date}</span>
            </div>
        </header>
    );
}


function ModeSelect({ onSelect }) {
    return (
        <main className="ms-root">
            <StatusBar />

            <div className="ms-body">
                <div className="ms-heading">
                    <p className="ms-eyebrow">Welcome To</p>
                    <h1 className="ms-title">Portfolio <span className="ms-title-accent">OS</span></h1>
                    <div className="ms-divider-row">
                        <div className="ms-divider-line" />
                        <div className="ms-divider-dot" />
                        <div className="ms-divider-line" />
                    </div>
                    <p className="ms-subtitle">Select how you want to enter the system.</p>
                </div>

                <div className="ms-cards">
                    <ModeCard
                        type="guest"
                        title="Guest"
                        description="Explore the portfolio as a visitor."
                        onClick={() => onSelect("guest")}
                    />
                    <ModeCard
                        type="admin"
                        title="Admin"
                        description="Manage and customize the portfolio."
                        onClick={() => onSelect("admin")}
                    />
                </div>
            </div>
        </main>
    );
}


function ModeCard({ type, title, description, onClick }) {
    return (
        <button onClick={onClick} className={`ms-card ms-card-${type}`}>
            {/* Top */}
            <div className="ms-card-top">
                <div className="ms-card-icon">
                    {type === "guest" ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <circle cx="12" cy="8" r="3.5"/>
                            <path d="M5 20c.7-3.5 3.2-5.5 7-5.5s6.3 2 7 5.5"/>
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <rect x="5" y="10" width="14" height="10" rx="2"/>
                            <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                            <circle cx="12" cy="15" r="1" fill="currentColor"/>
                        </svg>
                    )}
                </div>
                <span className="ms-card-mode-label">{type} mode</span>
            </div>

            {/* Content */}
            <h2 className="ms-card-title">{title}</h2>
            <p className="ms-card-desc">{description}</p>

            {/* Footer */}
            <div className="ms-card-footer">
                <span className="ms-card-enter">Enter</span>
                <span className="ms-card-arrow">→</span>
            </div>
        </button>
    );
}

export default ModeSelect;