import { useState, useEffect, useCallback } from "react";
import { apiGet } from "../../hooks/useApi";
import FormattedText from "../common/FormattedText";

const API_BASE = "http://localhost:3000";

function PortfolioShowcase() {
    const [profile, setProfile] = useState(null);
    const [projects, setProjects] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [autoPlay, setAutoPlay] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShowcaseData();
    }, []);

    const loadShowcaseData = async () => {
        try {
            const [profileRes, projectsRes] = await Promise.all([
                apiGet("/profile").catch(() => ({ data: null })),
                apiGet("/projects").catch(() => ({ data: [] }))
            ]);

            if (profileRes?.data) setProfile(profileRes.data);
            if (Array.isArray(projectsRes?.data)) setProjects(projectsRes.data);
        } catch (err) {
            console.error("Failed to load showcase presentation data:", err);
        }
        setLoading(false);
    };

    const totalSlides = 6;

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, [totalSlides]);

    const prevSlide = useCallback(() => {
        setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
    }, [totalSlides]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight" || e.key === "Space") {
                nextSlide();
            } else if (e.key === "ArrowLeft") {
                prevSlide();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide]);

    // Autoplay timer (5s per slide)
    useEffect(() => {
        if (!autoPlay) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [autoPlay, nextSlide]);

    if (loading) {
        return (
            <div className="ps-loading">
                <div className="ps-spinner" />
                <p>Loading Portfolio Presentation...</p>
            </div>
        );
    }

    const name = profile?.name || "Arju Srivastava";
    const bio = profile?.bio || "Software Development Engineer & Full-Stack Developer specializing in backend engineering, scalable APIs, and modern web applications.";
    const photoUrl = profile?.photo ? (profile.photo.startsWith("http") ? profile.photo : `${API_BASE}${profile.photo}`) : null;
    const skills = profile?.skills || ["React.js", "Node.js", "MongoDB", "Express.js", "JavaScript", "Docker", "Python", "REST APIs", "Git & GitHub", "Tailwind CSS"];
    const education = profile?.education || [];
    const experience = profile?.experience || [];
    const showcaseProjects = (profile?.projects && profile.projects.length > 0) ? profile.projects : projects;
    const social = profile?.socialLinks || {};

    return (
        <div className="portfolio-showcase-app ps-clean-theme">
            {/* Top Deck Bar */}
            <div className="ps-top-bar">
                <div className="ps-brand">
                    <span className="ps-brand-dot" />
                    <span className="ps-brand-title">{name} — Portfolio Showcase</span>
                </div>

                <div className="ps-controls">
                    <button
                        type="button"
                        className={`ps-autoplay-btn ${autoPlay ? "active" : ""}`}
                        onClick={() => setAutoPlay(prev => !prev)}
                        title={autoPlay ? "Pause Presentation" : "Start Autoplay (5s)"}
                    >
                        {autoPlay ? "Pause Slideshow" : "Start Autoplay"}
                    </button>

                    <span className="ps-slide-num">
                        {currentSlide + 1} / {totalSlides}
                    </span>
                </div>
            </div>

            {/* Slide Viewport */}
            <div className="ps-viewport">
                <div className="ps-slide-scroll">
                    {/* ════ SLIDE 1: HERO SPOTLIGHT ════ */}
                    {currentSlide === 0 && (
                        <div className="ps-slide ps-slide-hero">
                            <div className="ps-avatar-wrapper">
                                {photoUrl ? (
                                    <img src={photoUrl} alt={name} className="ps-avatar" />
                                ) : (
                                    <div className="ps-avatar ps-avatar-fallback">
                                        {name.charAt(0)}
                                    </div>
                                )}
                                <span className="ps-online-badge" title="Active" />
                            </div>

                            <span className="ps-hero-tag">FULL-STACK ARCHITECT & SOFTWARE ENGINEER</span>
                            <h1 className="ps-hero-name">{name}</h1>
                            
                            <div className="ps-hero-bio">
                                <FormattedText text={bio} />
                            </div>

                            <div className="ps-hero-stats">
                                <div className="ps-stat-box">
                                    <span className="ps-stat-val">{experience.length || 2}+</span>
                                    <span className="ps-stat-lbl">Experience Roles</span>
                                </div>
                                <div className="ps-stat-box">
                                    <span className="ps-stat-val">{showcaseProjects.length || 6}+</span>
                                    <span className="ps-stat-lbl">Featured Projects</span>
                                </div>
                                <div className="ps-stat-box">
                                    <span className="ps-stat-val">{skills.length}+</span>
                                    <span className="ps-stat-lbl">Technical Skills</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════ SLIDE 2: ABOUT & EDUCATION ════ */}
                    {currentSlide === 1 && (
                        <div className="ps-slide">
                            <div className="ps-slide-header">
                                <span className="ps-badge">SECTION 02 • PROFILE & EDUCATION</span>
                                <h2>About & Academic Background</h2>
                            </div>

                            <div className="ps-grid-2">
                                <div className="ps-card">
                                    <h3>Professional Summary</h3>
                                    <FormattedText text={bio} className="ps-text-p" />
                                </div>

                                <div className="ps-card">
                                    <h3>Academic Education</h3>
                                    {education.length > 0 ? (
                                        <div className="ps-edu-list">
                                            {education.map((edu, i) => (
                                                <div key={i} className="ps-edu-item">
                                                    <div className="ps-edu-degree">
                                                        {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                                                    </div>
                                                    <div className="ps-edu-inst">{edu.institute}</div>
                                                    <div className="ps-edu-meta">
                                                        {edu.startYear} - {edu.endYear} {edu.cpi ? `• CPI/GPA: ${edu.cpi}` : ""}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="ps-text-sub">
                                            Computer Science & Engineering background. Manage education history in Admin Panel.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════ SLIDE 3: SKILLS MATRIX ════ */}
                    {currentSlide === 2 && (
                        <div className="ps-slide">
                            <div className="ps-slide-header">
                                <span className="ps-badge">SECTION 03 • TECHNICAL STACK</span>
                                <h2>Skills & Frameworks</h2>
                            </div>

                            <div className="ps-card">
                                <p className="ps-text-sub" style={{ marginBottom: "16px" }}>
                                    Technical competencies and core technologies:
                                </p>
                                <div className="ps-skills-grid">
                                    {skills.map((skill, i) => (
                                        <div key={i} className="ps-skill-chip">
                                            <span>{skill}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════ SLIDE 4: WORK EXPERIENCE ════ */}
                    {currentSlide === 3 && (
                        <div className="ps-slide">
                            <div className="ps-slide-header">
                                <span className="ps-badge">SECTION 04 • CAREER HISTORY</span>
                                <h2>Work Experience</h2>
                            </div>

                            <div className="ps-card" style={{ padding: "16px" }}>
                                {experience.length > 0 ? (
                                    <div className="ps-timeline">
                                        {experience.map((exp, i) => (
                                            <div key={i} className="ps-timeline-item">
                                                <div className="ps-tl-content">
                                                    <div className="ps-tl-header">
                                                        <h4 className="ps-tl-role">{exp.role || "Software Engineer"}</h4>
                                                        <span className="ps-tl-period">{exp.startDate} - {exp.endDate || "Present"}</span>
                                                    </div>
                                                    <div className="ps-tl-company">{exp.company}</div>
                                                    <FormattedText text={exp.description} className="ps-tl-desc" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="ps-text-sub" style={{ textAlign: "center", padding: "24px 0" }}>
                                        No work experience added yet. Manage experience in Admin Panel.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════ SLIDE 5: PROJECTS SHOWCASE ════ */}
                    {currentSlide === 4 && (
                        <div className="ps-slide ps-slide-projects">
                            <div className="ps-slide-header">
                                <span className="ps-badge">SECTION 05 • FEATURED PROJECTS</span>
                                <h2>Showcase Projects</h2>
                                <p className="ps-slide-sub">{showcaseProjects.length} project{showcaseProjects.length !== 1 ? "s" : ""} built &amp; shipped</p>
                            </div>

                            {showcaseProjects.length === 0 ? (
                                <div className="ps-empty-state">
                                    <span>📦</span>
                                    <p>No projects added yet. Use Admin Panel to add showcase projects.</p>
                                </div>
                            ) : (
                                <div className="ps-proj-scroll-wrap">
                                    <div className="ps-proj-scroll">
                                        {showcaseProjects.map((proj, i) => {
                                            const gradients = [
                                                "linear-gradient(135deg,#3568e8 0%,#7c3aed 100%)",
                                                "linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)",
                                                "linear-gradient(135deg,#10b981 0%,#3568e8 100%)",
                                                "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)",
                                                "linear-gradient(135deg,#ec4899 0%,#8b5cf6 100%)",
                                                "linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)",
                                            ];
                                            const grad = gradients[i % gradients.length];
                                            const letter = (proj.title || "P").trim().charAt(0).toUpperCase();
                                            return (
                                                <div key={i} className="ps-proj-ai-card">
                                                    {/* Glow bg */}
                                                    <div className="ps-proj-glow" style={{ background: grad }} />

                                                    {/* Top row */}
                                                    <div className="ps-proj-ai-top">
                                                        <div className="ps-proj-ai-icon" style={{ background: grad }}>
                                                            {letter}
                                                        </div>
                                                        <div className="ps-proj-ai-meta">
                                                            <span className="ps-proj-ai-num">PROJECT {String(i + 1).padStart(2, "0")}</span>
                                                            <h4 className="ps-proj-ai-title">{proj.title || `Project #${i + 1}`}</h4>
                                                        </div>
                                                    </div>

                                                    {/* Description — clamped to 3 lines */}
                                                    <p className="ps-proj-ai-desc">
                                                        {(proj.description || "A featured project in the portfolio.").replace(/[#*\-_`>]/g, "").trim().slice(0, 180)}
                                                    </p>

                                                    {/* Tech tags */}
                                                    {proj.techStack && (
                                                        <div className="ps-proj-ai-techs">
                                                            {proj.techStack.split(",").slice(0, 4).map((t, idx) => (
                                                                <span key={idx} className="ps-proj-ai-tag">{t.trim()}</span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Buttons — always visible at bottom */}
                                                    <div className="ps-proj-ai-actions">
                                                        {proj.deploymentLink ? (
                                                            <a
                                                                href={proj.deploymentLink}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="ps-proj-ai-run"
                                                                style={{ background: grad }}
                                                            >
                                                                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                                                                    <polygon points="5 3 19 12 5 21 5 3"/>
                                                                </svg>
                                                                Run Live
                                                            </a>
                                                        ) : (
                                                            <span className="ps-proj-ai-no-run">No deploy yet</span>
                                                        )}

                                                        {proj.githubLink && (
                                                            <a
                                                                href={proj.githubLink}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="ps-proj-ai-gh"
                                                            >
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                                                </svg>
                                                                Code
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════ SLIDE 6: CONTACT & PROFILES ════ */}
                    {currentSlide === 5 && (
                        <div className="ps-slide">
                            <div className="ps-slide-header" style={{ textAlign: "center" }}>
                                <span className="ps-badge">SECTION 06 • CONTACT</span>
                                <h2>Get in Touch</h2>
                            </div>

                            <div className="ps-card ps-contact-card">
                                <div className="ps-contact-avatar-ring">
                                    {photoUrl ? (
                                        <img src={photoUrl} alt={name} />
                                    ) : (
                                        <div className="ps-avatar-fallback-sm">{name.charAt(0)}</div>
                                    )}
                                </div>
                                <h3>{name}</h3>
                                <p className="ps-contact-sub">Available for software engineering roles & technical projects</p>

                                <div className="ps-contact-links">
                                    {profile?.email && (
                                        <a href={`mailto:${profile.email}`} className="ps-c-btn">
                                            <span>Email: {profile.email}</span>
                                        </a>
                                    )}
                                    {social.github && (
                                        <a href={social.github} target="_blank" rel="noreferrer" className="ps-c-btn">
                                            <span>GitHub: {social.github}</span>
                                        </a>
                                    )}
                                    {social.linkedin && (
                                        <a href={social.linkedin} target="_blank" rel="noreferrer" className="ps-c-btn">
                                            <span>LinkedIn: {social.linkedin}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="ps-bottom-bar">
                <button type="button" className="ps-nav-arrow" onClick={prevSlide} title="Previous Slide">
                    Previous
                </button>

                <div className="ps-deck-dots">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            className={`ps-deck-dot ${idx === currentSlide ? "active" : ""}`}
                            onClick={() => setCurrentSlide(idx)}
                            title={`Jump to Slide ${idx + 1}`}
                        />
                    ))}
                </div>

                <button type="button" className="ps-nav-arrow" onClick={nextSlide} title="Next Slide">
                    Next
                </button>
            </div>
        </div>
    );
}

export default PortfolioShowcase;
