import { useEffect, useState } from "react";

function StatusBar() {
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");
    const [battery, setBattery] = useState(null);
    const [charging, setCharging] = useState(false);
    const [online, setOnline] = useState(navigator.onLine);

    // Live clock
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();

            setTime(
                now.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                })
            );

            setDate(
                now.toLocaleDateString([], {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })
            );
        };

        updateClock();

        const interval = setInterval(updateClock, 1000);

        return () => clearInterval(interval);
    }, []);

    // Real battery status
    useEffect(() => {
        let batteryManager;

        const updateBattery = () => {
            if (!batteryManager) return;

            setBattery(Math.round(batteryManager.level * 100));
            setCharging(batteryManager.charging);
        };

        const initBattery = async () => {
            if (!navigator.getBattery) {
                setBattery(null);
                return;
            }

            batteryManager = await navigator.getBattery();

            updateBattery();

            batteryManager.addEventListener("levelchange", updateBattery);
            batteryManager.addEventListener("chargingchange", updateBattery);
        };

        initBattery();

        return () => {
            if (!batteryManager) return;

            batteryManager.removeEventListener(
                "levelchange",
                updateBattery
            );

            batteryManager.removeEventListener(
                "chargingchange",
                updateBattery
            );
        };
    }, []);

    // Real online/offline state
    useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <header className="absolute top-0 left-0 right-0 h-[72px] border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 z-50">

            {/* LEFT */}
            <div className="flex items-center gap-4">

                {/* Chakra Logo */}
                <div className="w-11 h-11 rounded-full border border-slate-300 flex items-center justify-center bg-white">
                    <div className="text-[#1d3f91] text-[26px] leading-none">
                        ☸
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[15px] tracking-[0.25em] font-medium text-slate-900">
                        PORTFOLIO OS
                    </span>

                    <span className="text-[12px] font-medium text-[#3568e8]">
                        v1.0.0
                    </span>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-7 text-slate-800">

                {/* Network */}
                <div
                    title={online ? "Online" : "Offline"}
                    className="relative flex items-center"
                >
                    <svg
                        width="25"
                        height="25"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={online ? "text-slate-900" : "text-slate-300"}
                    >
                        <path d="M5 13a10 10 0 0 1 14 0" />
                        <path d="M8.5 16a5 5 0 0 1 7 0" />
                        <path d="M12 19h.01" />
                    </svg>
                </div>

                {/* Speaker */}
                <div title="System volume">
                    <svg
                        width="25"
                        height="25"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                    </svg>
                </div>

                {/* Battery */}
                <div
                    title={
                        battery !== null
                            ? `${battery}%${charging ? " • Charging" : ""}`
                            : "Battery information unavailable"
                    }
                    className="flex items-center gap-2"
                >
                    <div className="relative w-[31px] h-[15px] border-[1.8px] border-slate-800 rounded-[3px] p-[2px]">
                        <div
                            className="h-full rounded-[1px] bg-slate-800 transition-all duration-500"
                            style={{
                                width:
                                    battery !== null
                                        ? `${battery}%`
                                        : "70%",
                            }}
                        />

                        <div className="absolute -right-[4px] top-[4px] w-[2px] h-[5px] bg-slate-800 rounded-r" />
                    </div>

                    {charging && (
                        <span className="text-[11px] text-[#3568e8]">
                            ⚡
                        </span>
                    )}
                </div>

                {/* Divider */}
                <div className="h-7 w-px bg-slate-200" />

                {/* Time */}
                <div className="text-[15px] font-medium tracking-wide text-slate-900 min-w-[76px]">
                    {time}
                </div>

                {/* Date */}
                <div className="text-[14px] tracking-wide text-[#3568e8] min-w-[105px]">
                    {date}
                </div>

            </div>
        </header>
    );
}


function ModeSelect({ onSelect }) {
    return (
        <main className="min-h-screen bg-[#f8f9fc] text-slate-900 flex items-center justify-center px-6">

            <StatusBar />

            <div className="w-full max-w-4xl pt-16">

                {/* Heading */}
                <div className="text-center mb-14 mode-header">

                    <p className="text-[10px] tracking-[0.5em] uppercase text-[#3568e8] mb-5">
                        Welcome To
                    </p>

                    <h1 className="text-5xl md:text-6xl font-light tracking-tight">
                        Portfolio{" "}
                        <span className="text-[#3568e8]">
                            OS
                        </span>
                    </h1>

                    <div className="flex items-center justify-center gap-3 mt-6">
                        <div className="w-16 h-px bg-slate-200" />
                        <div className="w-2 h-2 rounded-full bg-[#3568e8]" />
                        <div className="w-16 h-px bg-slate-200" />
                    </div>

                    <p className="mt-6 text-[16px] text-slate-500">
                        Select how you want to enter the system.
                    </p>

                </div>


                {/* Modes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">

                    <ModeCard
                        type="guest"
                        title="Guest"
                        description="Explore the portfolio as a guest."
                        onClick={() => onSelect("guest")}
                    />

                    <ModeCard
                        type="admin"
                        title="Admin"
                        description="Manage and customize the portfolio system."
                        onClick={() => onSelect("admin")}
                    />

                </div>

            </div>
        </main>
    );
}


function ModeCard({
    type,
    title,
    description,
    onClick,
}) {
    return (
        <button
            onClick={onClick}
            className="
                group
                relative
                text-left
                rounded-2xl
                border border-slate-200
                bg-white/80
                backdrop-blur-sm
                p-9
                shadow-[0_10px_30px_rgba(15,23,42,0.06)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#3568e8]/40
                hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]
                active:scale-[0.99]
            "
        >

            {/* Top row */}
            <div className="flex items-start justify-between">

                {/* Icon */}
                <div
                    className="
                        w-14
                        h-14
                        rounded-2xl
                        bg-[#eef3ff]
                        border border-[#e1e9ff]
                        flex
                        items-center
                        justify-center
                        text-[#3568e8]
                    "
                >
                    {type === "guest" ? (
                        <svg
                            width="27"
                            height="27"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                        >
                            <circle cx="12" cy="8" r="3.5" />
                            <path d="M5 20c.7-3.5 3.2-5.5 7-5.5s6.3 2 7 5.5" />
                        </svg>
                    ) : (
                        <svg
                            width="27"
                            height="27"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                        >
                            <rect
                                x="5"
                                y="10"
                                width="14"
                                height="10"
                                rx="2"
                            />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                            <circle cx="12" cy="15" r="1" />
                        </svg>
                    )}
                </div>

                {/* Mode */}
                <div className="flex items-center gap-3">

                    <span className="text-[11px] tracking-[0.2em] text-[#3568e8] uppercase">
                        {type} mode
                    </span>

                    <span className="w-3 h-3 rounded-full bg-slate-300 group-hover:bg-[#3568e8] transition-colors" />

                </div>

            </div>


            {/* Content */}
            <h2 className="mt-9 text-2xl font-medium">
                {title}
            </h2>

            <p className="mt-3 text-[15px] leading-7 text-slate-500 max-w-[260px]">
                {description}
            </p>


            {/* Bottom */}
            <div className="mt-9 pt-6 border-t border-slate-200 flex items-center justify-between">

                <span className="text-[11px] tracking-[0.25em] uppercase text-[#3568e8]">
                    Enter
                </span>

                <span className="text-2xl text-[#3568e8] transition-transform duration-300 group-hover:translate-x-1">
                    →
                </span>

            </div>

        </button>
    );
}

export default ModeSelect;