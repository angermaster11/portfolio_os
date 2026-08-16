import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { apiGet } from "../../hooks/useApi";
import FormattedText from "../common/FormattedText";

function ProjectManager() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [viewMode, setViewMode] = useState("preview");

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            // Get projects from Profile & Project Tree root repos
            const profileRes = await apiGet("/profile");
            const profileProjs = profileRes.data?.projects || [];

            const treeRes = await apiGet("/projects/tree");
            const treeProjs = (treeRes.data || []).map(node => ({
                id: node._id,
                title: node.name,
                description: node.description || "Cloned GitHub Repository",
                techStack: node.language || "Multi-language",
                githubLink: node.githubLink || "",
                deploymentLink: node.deploymentLink || "",
                readmeContent: node.content || ""
            }));

            // Combine showcase projects and tree repos
            const combined = [
                ...profileProjs.map((p, idx) => ({ ...p, id: `prof-${idx}` })),
                ...treeProjs
            ];

            setProjects(combined);
        } catch (err) {
            console.error("Failed to load project manager data:", err);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="fm-loading">
                <div className="fm-spinner" />
                <p>Loading projects...</p>
            </div>
        );
    }

    return (
        <div className="project-manager">
            {/* Left/Main list of projects */}
            <div className="pm-sidebar-list">
                <div className="pm-header">
                    <h3>🗂️ Showcase & Repositories</h3>
                    <span className="pm-count">{projects.length} Projects</span>
                </div>

                <div className="pm-list">
                    {projects.length === 0 ? (
                        <div className="pm-empty">
                            <span>📦</span>
                            <p>No projects available. Add projects from Admin Panel!</p>
                        </div>
                    ) : (
                        projects.map((proj, idx) => (
                            <div
                                key={proj.id || idx}
                                className={`pm-card ${selectedProject?.id === proj.id ? "selected" : ""}`}
                                onClick={() => setSelectedProject(proj)}
                            >
                                <div className="pm-card-top">
                                    <span className="pm-card-icon">⚡</span>
                                    <h4 className="pm-card-title">{proj.title || "Untitled Project"}</h4>
                                </div>

                                {proj.techStack && (
                                    <div className="pm-card-tech">{proj.techStack}</div>
                                )}

                                <FormattedText text={proj.description || "Click to view README & project details..."} className="pm-card-desc" />

                                <div className="pm-card-actions" onClick={e => e.stopPropagation()}>
                                    {proj.deploymentLink && (
                                        <a
                                            href={proj.deploymentLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="pm-btn pm-btn-run"
                                        >
                                            ▶ RUN
                                        </a>
                                    )}

                                    {proj.githubLink && (
                                        <a
                                            href={proj.githubLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="pm-btn pm-btn-gh"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                            </svg>
                                            GitHub
                                        </a>
                                    )}

                                    <button
                                        className="pm-btn pm-btn-detail"
                                        onClick={() => setSelectedProject(proj)}
                                    >
                                        📖 Readme
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right detail view for README / information */}
            {selectedProject && (
                <div className="pm-detail-pane">
                    <div className="pm-detail-header">
                        <div>
                            <h2>{selectedProject.title}</h2>
                            {selectedProject.techStack && (
                                <span className="pm-tech-badge">{selectedProject.techStack}</span>
                            )}
                        </div>

                        <div className="pm-detail-actions">
                            {selectedProject.deploymentLink && (
                                <a
                                    href={selectedProject.deploymentLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="pm-btn pm-btn-run-lg"
                                >
                                    ▶ RUN LIVE APP
                                </a>
                            )}
                            <button
                                className="pm-close-btn"
                                onClick={() => setSelectedProject(null)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="pm-detail-body">
                        {selectedProject.readmeContent ? (
                            <div className="pm-readme-container">
                                <div className="pm-readme-header">
                                    <span className="pm-readme-tag">📄 README.md</span>
                                    <div className="pm-readme-tabs">
                                        <button
                                            className={`pm-readme-tab ${viewMode === "preview" ? "active" : ""}`}
                                            onClick={() => setViewMode("preview")}
                                        >
                                            👁️ Preview
                                        </button>
                                        <button
                                            className={`pm-readme-tab ${viewMode === "raw" ? "active" : ""}`}
                                            onClick={() => setViewMode("raw")}
                                        >
                                            💻 Raw Code
                                        </button>
                                    </div>
                                </div>

                                {viewMode === "preview" ? (
                                    <div className="pm-readme-rendered markdown-preview">
                                        <ReactMarkdown>{selectedProject.readmeContent}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <pre className="pm-readme-text">
                                        {selectedProject.readmeContent}
                                    </pre>
                                )}
                            </div>
                        ) : (
                            <div className="pm-detail-info">
                                <h4>Project Details</h4>
                                <FormattedText text={selectedProject.description || "No description provided."} />
                                {selectedProject.githubLink && (
                                    <p>
                                        <strong>Repository: </strong>
                                        <a href={selectedProject.githubLink} target="_blank" rel="noreferrer">
                                            {selectedProject.githubLink}
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectManager;
