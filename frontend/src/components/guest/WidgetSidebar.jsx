import { useState, useEffect } from "react";
import { apiGet } from "../../hooks/useApi";

const DEFAULT_SLIDES = [
    {
        badge: "Full Stack & AI Engineer",
        title: "Crafting High-Performance Products 🚀",
        description: "Arju Srivastava specializes in scalable Node.js microservices, React web apps, and RAG-powered AI solutions.",
        icon: "⚡",
        linkText: "View Projects",
        linkApp: "project-manager",
        bgGradient: "blue",
        isVisible: true
    },
    {
        badge: "AskGPT AI Assistant",
        title: "Intelligent RAG Assistant Online 🤖",
        description: "Chat with AskGPT to query Arju's custom knowledge base, skills, projects, and work experience in real-time.",
        icon: "🧠",
        linkText: "Ask AI Now",
        linkApp: "askgpt",
        bgGradient: "purple",
        isVisible: true
    },
    {
        badge: "Backend & Systems",
        title: "API Design & Cloud Architecture 🛠️",
        description: "Proven expertise in RESTful APIs, JWT Authentication, MongoDB, Docker, and production-oriented workflows.",
        icon: "⚙️",
        linkText: "My Profile",
        linkApp: "profile",
        bgGradient: "emerald",
        isVisible: true
    }
];

function WidgetSidebar({ onOpenApp }) {
    const [enabled, setEnabled] = useState(true);
    const [widgetTitle, setWidgetTitle] = useState("Highlights & Spotlight");
    const [slides, setSlides] = useState(DEFAULT_SLIDES);
    const [slideInterval, setSlideInterval] = useState(5);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await apiGet("/widgets");
            if (res.data) {
                setEnabled(res.data.enabled !== false);
                setWidgetTitle(res.data.title || "Highlights & Spotlight");
                if (res.data.slides && res.data.slides.length > 0) {
                    setSlides(res.data.slides);
                }
                setSlideInterval(res.data.slideInterval || 5);
            }
        } catch (err) {
            console.error("Failed to load widget config:", err);
        }
    };

    const visibleSlides = slides.filter(s => s.isVisible !== false);

    // Auto-advance slides based on timer
    useEffect(() => {
        if (!enabled || visibleSlides.length <= 1 || isPaused || collapsed) return;

        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % visibleSlides.length);
        }, slideInterval * 1000);

        return () => clearInterval(timer);
    }, [enabled, visibleSlides.length, slideInterval, isPaused, collapsed]);

    // Don't render widget if disabled by admin or no visible slides
    if (!enabled || visibleSlides.length === 0) {
        return null;
    }

    const safeIndex = currentIndex % visibleSlides.length;
    const activeSlide = visibleSlides[safeIndex] || visibleSlides[0];

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % visibleSlides.length);
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev - 1 + visibleSlides.length) % visibleSlides.length);
    };

    const getAppTitle = (appId) => {
        switch (appId) {
            case "project-manager": return { title: "Project Manager", icon: "🗂️", width: 900, height: 600 };
            case "askgpt": return { title: "AskGPT AI", icon: "🤖", width: 850, height: 580 };
            case "profile": return { title: "My Profile", icon: "👤", width: 700, height: 550 };
            case "file-manager": return { title: "File Manager", icon: "📁", width: 850, height: 550 };
            case "music-player": return { title: "Music Player", icon: "🎵", width: 850, height: 560 };
            default: return { title: "Project Manager", icon: "🗂️", width: 900, height: 600 };
        }
    };

    const handleActionClick = () => {
        if (onOpenApp && activeSlide?.linkApp) {
            const appConfig = getAppTitle(activeSlide.linkApp);
            onOpenApp({ id: activeSlide.linkApp, ...appConfig });
        }
    };

    const gradientClass = activeSlide?.bgGradient ? `theme-${activeSlide.bgGradient}` : "theme-blue";

    return (
        <aside
            className={`desktop-widget-sidebar ${gradientClass} ${collapsed ? "collapsed" : ""}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Header bar */}
            <div className="dw-header">
                <div className="dw-header-left">
                    <span className="dw-badge-icon">📢</span>
                    <span className="dw-header-title">{widgetTitle}</span>
                </div>
                <div className="dw-header-actions">
                    {!collapsed && (
                        <span className="dw-counter">
                            {safeIndex + 1} / {visibleSlides.length}
                        </span>
                    )}
                    <button
                        className="dw-collapse-btn"
                        onClick={() => setCollapsed(prev => !prev)}
                        title={collapsed ? "Expand Widget" : "Minimize Widget"}
                    >
                        {collapsed ? "+" : "—"}
                    </button>
                </div>
            </div>

            {!collapsed && activeSlide && (
                <div className="dw-content">
                    {/* Badge Tag */}
                    <div className="dw-slide-badge">
                        <span>{activeSlide.icon || "✨"}</span>
                        <span>{activeSlide.badge || "Highlight"}</span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="dw-slide-title">{activeSlide.title}</h3>
                    <p className="dw-slide-desc">{activeSlide.description}</p>

                    {/* CTA Button & Nav Controls */}
                    <div className="dw-footer">
                        <button
                            className="dw-cta-btn"
                            onClick={handleActionClick}
                        >
                            <span>{activeSlide.linkText || "Explore"}</span>
                            <span style={{ fontSize: "11px" }}>➜</span>
                        </button>

                        <div className="dw-nav-arrows">
                            <button className="dw-arrow" onClick={handlePrev} title="Previous slide">‹</button>
                            <button className="dw-arrow" onClick={handleNext} title="Next slide">›</button>
                        </div>
                    </div>

                    {/* Dots indicator */}
                    {visibleSlides.length > 1 && (
                        <div className="dw-dots">
                            {visibleSlides.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`dw-dot ${idx === safeIndex ? "active" : ""}`}
                                    onClick={() => setCurrentIndex(idx)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}

export default WidgetSidebar;
