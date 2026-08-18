import { useState, useEffect } from "react";
import { apiGet } from "../../hooks/useApi";
import FormattedText from "../common/FormattedText";

function ProfileViewer() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("about");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await apiGet("/profile");
            setProfile(data.data);
        } catch (err) {
            console.error("Failed to load profile:", err);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="fm-loading">
                <div className="fm-spinner" />
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return <div className="pv-empty">No profile data available.</div>;
    }

    const tabs = [
        { key: "about", label: "About" },
        { key: "education", label: "Education" },
        { key: "experience", label: "Experience" },
        { key: "projects", label: "Projects" },
        { key: "certifications", label: "Certs" }
    ];

    return (
        <div className="profile-viewer">
            {/* Header */}
            <div className="pv-header">
                <div className="pv-avatar">
                    {profile.photo ? (
                        <img src={profile.photo} alt="Profile" />
                    ) : (
                        <span className="pv-avatar-placeholder">
                            {(profile.name || "U")[0].toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="pv-info">
                    <h2 className="pv-name">{profile.name || "No name set"}</h2>
                    {profile.email && <p className="pv-detail">📧 {profile.email}</p>}
                    {profile.phone && <p className="pv-detail">📱 {profile.phone}</p>}
                </div>
                <div className="pv-socials">
                    {profile.socialLinks?.github && (
                        <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="pv-social-link" title="GitHub">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                    )}
                    {profile.socialLinks?.linkedin && (
                        <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="pv-social-link" title="LinkedIn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="pv-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`pv-tab ${activeTab === tab.key ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="pv-content">
                {activeTab === "about" && (
                    <div className="pv-section">
                        <FormattedText text={profile.bio || "No bio yet."} className="pv-bio" />

                        {(profile.extraActivities || []).length > 0 && (
                            <>
                                <h4 className="pv-sub-title">Activities</h4>
                                {profile.extraActivities.map((act, i) => (
                                    <div key={i} className="pv-card">
                                        <strong>{act.title}</strong>
                                        {act.description && <FormattedText text={act.description} />}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {activeTab === "education" && (
                    <div className="pv-section">
                        {(profile.education || []).length === 0 ? (
                            <p className="pv-empty-text">No education data.</p>
                        ) : (
                            profile.education.map((edu, i) => (
                                <div key={i} className="pv-card">
                                    <strong>{edu.institute}</strong>
                                    <p>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                                    {edu.cpi && <p className="pv-meta">CPI: {edu.cpi}</p>}
                                    <p className="pv-meta">{edu.startYear} — {edu.endYear || "Present"}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "experience" && (
                    <div className="pv-section">
                        {(profile.experience || []).length === 0 ? (
                            <p className="pv-empty-text">No experience data.</p>
                        ) : (
                            profile.experience.map((exp, i) => (
                                <div key={i} className="pv-card">
                                    <strong>{exp.role}</strong>
                                    <p>{exp.company}</p>
                                    {exp.description && <FormattedText text={exp.description} className="pv-desc" />}
                                    <p className="pv-meta">{exp.startDate} — {exp.endDate || "Present"}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "projects" && (
                    <div className="pv-section">
                        {(profile.projects || []).length === 0 ? (
                            <p className="pv-empty-text">No projects data.</p>
                        ) : (
                            profile.projects.map((proj, i) => (
                                <div key={i} className="pv-card">
                                    <strong>{proj.title}</strong>
                                    {proj.techStack && <p className="pv-tech">{proj.techStack}</p>}
                                    {proj.description && <FormattedText text={proj.description} className="pv-desc" />}
                                    <div className="pv-links">
                                        {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noreferrer">GitHub</a>}
                                        {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noreferrer">Live</a>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "certifications" && (
                    <div className="pv-section">
                        {(profile.certifications || []).length === 0 ? (
                            <p className="pv-empty-text">No certifications data.</p>
                        ) : (
                            profile.certifications.map((cert, i) => (
                                <div key={i} className="pv-card">
                                    <strong>{cert.title}</strong>
                                    <p>{cert.issuer}</p>
                                    {cert.date && <p className="pv-meta">{cert.date}</p>}
                                    {cert.link && <a href={cert.link} target="_blank" rel="noreferrer" className="pv-link">View Certificate</a>}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfileViewer;
