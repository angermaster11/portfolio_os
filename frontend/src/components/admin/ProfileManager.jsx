import { useState, useEffect, useRef } from "react";
import { apiGet, apiPut, apiPost } from "../../hooks/useApi";

const SECTIONS = [
    { key: "basic", label: "Basic Info", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
    { key: "skills", label: "Skills", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
    { key: "education", label: "Education", icon: "M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z" },
    { key: "experience", label: "Experience", icon: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" },
    { key: "certifications", label: "Certifications", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
    { key: "activities", label: "Activities", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
    { key: "projects", label: "Showcase Projects", icon: "M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" },
    { key: "social", label: "Social Links", icon: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" }
];

function ProfileManager() {
    const [profile, setProfile] = useState(null);
    const [activeSection, setActiveSection] = useState("basic");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await apiGet("/profile");
            setProfile(data.data);
            if (data.data.photo) {
                setPhotoPreview(`http://localhost:3000${data.data.photo}`);
            }
        } catch (err) {
            console.error("Failed to load profile:", err);
            setProfile({
                name: "", email: "", phone: "", bio: "",
                education: [], experience: [], certifications: [],
                extraActivities: [], projects: [],
                socialLinks: { github: "", linkedin: "", twitter: "", website: "" }
            });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiPut("/profile", profile);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Save failed:", err);
        }
        setSaving(false);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPhotoPreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("photo", file);

        try {
            const data = await apiPost("/profile/photo", formData);
            setProfile(prev => ({ ...prev, photo: data.data.photo }));
        } catch (err) {
            console.error("Photo upload failed:", err);
        }
    };

    const updateField = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const updateArrayItem = (arrayKey, index, field, value) => {
        setProfile(prev => {
            const arr = [...(prev[arrayKey] || [])];
            arr[index] = { ...arr[index], [field]: value };
            return { ...prev, [arrayKey]: arr };
        });
    };

    const addArrayItem = (arrayKey, template) => {
        setProfile(prev => ({
            ...prev,
            [arrayKey]: [...(prev[arrayKey] || []), template]
        }));
    };

    const removeArrayItem = (arrayKey, index) => {
        setProfile(prev => ({
            ...prev,
            [arrayKey]: prev[arrayKey].filter((_, i) => i !== index)
        }));
    };

    const updateSocial = (field, value) => {
        setProfile(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [field]: value }
        }));
    };

    if (!profile) {
        return (
            <div className="admin-loading">
                <span className="admin-login-spinner" />
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-manager">
            {/* Section tabs */}
            <div className="profile-tabs">
                {SECTIONS.map(s => (
                    <button
                        key={s.key}
                        className={`profile-tab ${activeSection === s.key ? "active" : ""}`}
                        onClick={() => setActiveSection(s.key)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d={s.icon} />
                        </svg>
                        <span>{s.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="profile-content">
                {activeSection === "basic" && (
                    <div className="profile-section">
                        <h3 className="profile-section-title">Basic Information</h3>

                        {/* Photo */}
                        <div className="profile-photo-section">
                            <div
                                className="profile-photo-preview"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Profile" />
                                ) : (
                                    <div className="profile-photo-placeholder">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <path d="M21 15l-5-5L5 21" />
                                        </svg>
                                        <span>Upload Photo</span>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                style={{ display: "none" }}
                            />
                        </div>

                        <div className="profile-fields-grid">
                            <FieldInput label="Full Name" value={profile.name} onChange={v => updateField("name", v)} />
                            <FieldInput label="Email" value={profile.email} onChange={v => updateField("email", v)} type="email" />
                            <FieldInput label="Phone" value={profile.phone} onChange={v => updateField("phone", v)} />
                        </div>

                        <FieldTextarea label="Bio" value={profile.bio} onChange={v => updateField("bio", v)} />
                    </div>
                )}

                {activeSection === "skills" && (
                    <div className="profile-section">
                        <div className="profile-section-header">
                            <div>
                                <h3 className="profile-section-title">Skills & Technologies</h3>
                                <p className="askgpt-section-desc">Manage your technical skills, programming languages, and framework tags.</p>
                            </div>
                            <button
                                className="profile-add-btn"
                                onClick={() => {
                                    const skill = window.prompt("Enter new skill name (e.g. React.js, Python, Docker):");
                                    if (skill && skill.trim()) {
                                        setProfile(prev => ({
                                            ...prev,
                                            skills: [...(prev.skills || []), skill.trim()]
                                        }));
                                    }
                                }}
                            >
                                + Add Skill
                            </button>
                        </div>

                        <div className="ps-skills-grid" style={{ marginTop: "16px" }}>
                            {(profile.skills || []).map((sk, i) => (
                                <div key={i} className="ps-skill-chip" style={{ justifyContent: "space-between", gap: "10px" }}>
                                    <span>⚡ {sk}</span>
                                    <button
                                        type="button"
                                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "14px", marginLeft: "6px" }}
                                        onClick={() => {
                                            setProfile(prev => ({
                                                ...prev,
                                                skills: prev.skills.filter((_, idx) => idx !== i)
                                            }));
                                        }}
                                        title="Remove Skill"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        {(profile.skills || []).length === 0 && (
                            <p className="profile-empty">No skills added yet. Click "+ Add Skill" to begin.</p>
                        )}
                    </div>
                )}

                {activeSection === "education" && (
                    <div className="profile-section">
                        <div className="profile-section-header">
                            <h3 className="profile-section-title">Education</h3>
                            <button
                                className="profile-add-btn"
                                onClick={() => addArrayItem("education", {
                                    institute: "", degree: "", field: "",
                                    cpi: "", startYear: "", endYear: ""
                                })}
                            >
                                + Add Education
                            </button>
                        </div>

                        {(profile.education || []).map((edu, i) => (
                            <div key={i} className="profile-card">
                                <button className="profile-card-remove" onClick={() => removeArrayItem("education", i)}>×</button>
                                <div className="profile-fields-grid">
                                    <FieldInput label="Institute" value={edu.institute} onChange={v => updateArrayItem("education", i, "institute", v)} />
                                    <FieldInput label="Degree" value={edu.degree} onChange={v => updateArrayItem("education", i, "degree", v)} />
                                    <FieldInput label="Field of Study" value={edu.field} onChange={v => updateArrayItem("education", i, "field", v)} />
                                    <FieldInput label="CPI / GPA (optional)" value={edu.cpi} onChange={v => updateArrayItem("education", i, "cpi", v)} />
                                    <FieldInput label="Start Year" value={edu.startYear} onChange={v => updateArrayItem("education", i, "startYear", v)} />
                                    <FieldInput label="End Year" value={edu.endYear} onChange={v => updateArrayItem("education", i, "endYear", v)} />
                                </div>
                            </div>
                        ))}

                        {(profile.education || []).length === 0 && (
                            <p className="profile-empty">No education entries yet. Click "Add Education" to begin.</p>
                        )}
                    </div>
                )}

                {activeSection === "experience" && (
                    <div className="profile-section">
                        <div className="profile-section-header">
                            <h3 className="profile-section-title">Experience</h3>
                            <button
                                className="profile-add-btn"
                                onClick={() => addArrayItem("experience", {
                                    company: "", role: "", description: "",
                                    startDate: "", endDate: ""
                                })}
                            >
                                + Add Experience
                            </button>
                        </div>

                        {(profile.experience || []).map((exp, i) => (
                            <div key={i} className="profile-card">
                                <button className="profile-card-remove" onClick={() => removeArrayItem("experience", i)}>×</button>
                                <div className="profile-fields-grid">
                                    <FieldInput label="Company Name" value={exp.company} onChange={v => updateArrayItem("experience", i, "company", v)} />
                                    <FieldInput label="Role / Title" value={exp.role} onChange={v => updateArrayItem("experience", i, "role", v)} />
                                    <FieldInput label="Start Date" value={exp.startDate} onChange={v => updateArrayItem("experience", i, "startDate", v)} />
                                    <FieldInput label="End Date" value={exp.endDate} onChange={v => updateArrayItem("experience", i, "endDate", v)} />
                                </div>
                                <FieldTextarea label="Description / Responsibilities" value={exp.description} onChange={v => updateArrayItem("experience", i, "description", v)} />
                            </div>
                        ))}

                        {(profile.experience || []).length === 0 && (
                            <p className="profile-empty">No experience entries yet. Click "+ Add Experience" above.</p>
                        )}
                    </div>
                )}

                {activeSection === "certifications" && (
                    <div className="profile-section">
                        <div className="profile-section-header">
                            <h3 className="profile-section-title">Certifications</h3>
                            <button
                                className="profile-add-btn"
                                onClick={() => addArrayItem("certifications", {
                                    title: "", issuer: "", date: "", link: ""
                                })}
                            >
                                + Add Certification
                            </button>
                        </div>

                        {(profile.certifications || []).map((cert, i) => (
                            <div key={i} className="profile-card">
                                <button className="profile-card-remove" onClick={() => removeArrayItem("certifications", i)}>×</button>
                                <div className="profile-fields-grid">
                                    <FieldInput label="Title" value={cert.title} onChange={v => updateArrayItem("certifications", i, "title", v)} />
                                    <FieldInput label="Issuer" value={cert.issuer} onChange={v => updateArrayItem("certifications", i, "issuer", v)} />
                                    <FieldInput label="Date" value={cert.date} onChange={v => updateArrayItem("certifications", i, "date", v)} />
                                    <FieldInput label="Link" value={cert.link} onChange={v => updateArrayItem("certifications", i, "link", v)} />
                                </div>
                            </div>
                        ))}

                        {(profile.certifications || []).length === 0 && (
                            <p className="profile-empty">No certifications yet.</p>
                        )}
                    </div>
                )}

                {activeSection === "activities" && (
                    <div className="profile-section">
                        <div className="profile-section-header">
                            <h3 className="profile-section-title">Extra Activities</h3>
                            <button
                                className="profile-add-btn"
                                onClick={() => addArrayItem("extraActivities", {
                                    title: "", description: ""
                                })}
                            >
                                + Add Activity
                            </button>
                        </div>

                        {(profile.extraActivities || []).map((act, i) => (
                            <div key={i} className="profile-card">
                                <button className="profile-card-remove" onClick={() => removeArrayItem("extraActivities", i)}>×</button>
                                <FieldInput label="Title" value={act.title} onChange={v => updateArrayItem("extraActivities", i, "title", v)} />
                                <FieldTextarea label="Description" value={act.description} onChange={v => updateArrayItem("extraActivities", i, "description", v)} />
                            </div>
                        ))}

                        {(profile.extraActivities || []).length === 0 && (
                            <p className="profile-empty">No activities yet.</p>
                        )}
                    </div>
                )}

                {activeSection === "projects" && (
                    <div className="profile-section">
                        <div className="profile-section-header">
                            <h3 className="profile-section-title">Showcase Projects (For Project Manager App)</h3>
                            <button
                                className="profile-add-btn"
                                onClick={() => addArrayItem("projects", {
                                    title: "", description: "", techStack: "",
                                    deploymentLink: "", githubLink: "", readmeContent: ""
                                })}
                            >
                                + Add Showcase Project
                            </button>
                        </div>

                        {(profile.projects || []).map((proj, i) => (
                            <div key={i} className="profile-card">
                                <button className="profile-card-remove" onClick={() => removeArrayItem("projects", i)}>×</button>
                                <div className="profile-fields-grid">
                                    <FieldInput label="Project Title" value={proj.title} onChange={v => updateArrayItem("projects", i, "title", v)} />
                                    <FieldInput label="Tech Stack" value={proj.techStack} onChange={v => updateArrayItem("projects", i, "techStack", v)} placeholder="React, Node, MongoDB..." />
                                    <FieldInput label="Deployment Link (RUN button URL)" value={proj.deploymentLink || proj.liveLink} onChange={v => updateArrayItem("projects", i, "deploymentLink", v)} placeholder="https://my-app.vercel.app" />
                                    <FieldInput label="GitHub Repo Link" value={proj.githubLink} onChange={v => updateArrayItem("projects", i, "githubLink", v)} placeholder="https://github.com/user/repo" />
                                </div>
                                <FieldTextarea label="Short Description" value={proj.description} onChange={v => updateArrayItem("projects", i, "description", v)} />
                                <FieldTextarea label="README Content (Markdown / Full Details)" value={proj.readmeContent} onChange={v => updateArrayItem("projects", i, "readmeContent", v)} />
                            </div>
                        ))}

                        {(profile.projects || []).length === 0 && (
                            <p className="profile-empty">No showcase projects yet. Click "+ Add Showcase Project" to add projects for Project Manager.</p>
                        )}
                    </div>
                )}

                {activeSection === "social" && (
                    <div className="profile-section">
                        <h3 className="profile-section-title">Social Links</h3>
                        <div className="profile-fields-grid">
                            <FieldInput label="GitHub" value={profile.socialLinks?.github || ""} onChange={v => updateSocial("github", v)} placeholder="https://github.com/..." />
                            <FieldInput label="LinkedIn" value={profile.socialLinks?.linkedin || ""} onChange={v => updateSocial("linkedin", v)} placeholder="https://linkedin.com/in/..." />
                            <FieldInput label="Twitter" value={profile.socialLinks?.twitter || ""} onChange={v => updateSocial("twitter", v)} placeholder="https://twitter.com/..." />
                            <FieldInput label="Website" value={profile.socialLinks?.website || ""} onChange={v => updateSocial("website", v)} placeholder="https://..." />
                        </div>
                    </div>
                )}
            </div>

            {/* Save bar */}
            <div className="profile-save-bar">
                <button
                    className={`profile-save-btn ${saved ? "saved" : ""}`}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <span className="admin-login-spinner" />
                    ) : saved ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Saved!
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function FieldInput({ label, value, onChange, type = "text", placeholder = "" }) {
    return (
        <div className="profile-field">
            <label className="profile-field-label">{label}</label>
            <input
                type={type}
                value={value || ""}
                onChange={e => onChange(e.target.value)}
                className="profile-field-input"
                placeholder={placeholder || label}
            />
        </div>
    );
}

function FieldTextarea({ label, value, onChange }) {
    return (
        <div className="profile-field profile-field-full">
            <label className="profile-field-label">{label}</label>
            <textarea
                value={value || ""}
                onChange={e => onChange(e.target.value)}
                className="profile-field-textarea"
                placeholder={label}
                rows={4}
            />
        </div>
    );
}

export default ProfileManager;
