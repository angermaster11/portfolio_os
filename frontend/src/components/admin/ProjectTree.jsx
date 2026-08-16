import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../hooks/useApi";

function ProjectTree() {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [selectedId, setSelectedId] = useState(null);
    const [githubUrl, setGithubUrl] = useState("");
    const [deploymentUrl, setDeploymentUrl] = useState("");
    const [cloning, setCloning] = useState(false);
    const [showNewForm, setShowNewForm] = useState(null); // { parentId, type }
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");

    useEffect(() => {
        loadTree();
    }, []);

    const loadTree = async () => {
        try {
            const data = await apiGet("/projects/tree");
            setTree(data.data || []);
        } catch (err) {
            console.error("Failed to load tree:", err);
        }
        setLoading(false);
    };

    const toggleExpand = (id) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleCreate = async () => {
        if (!newName.trim() || !showNewForm) return;

        try {
            await apiPost("/projects/node", {
                name: newName.trim(),
                type: showNewForm.type,
                parentId: showNewForm.parentId
            });
            setNewName("");
            setShowNewForm(null);
            await loadTree();
        } catch (err) {
            console.error("Create failed:", err);
        }
    };

    const handleRename = async (id) => {
        if (!editName.trim()) return;

        try {
            await apiPut(`/projects/node/${id}`, { name: editName.trim() });
            setEditingId(null);
            setEditName("");
            await loadTree();
        } catch (err) {
            console.error("Rename failed:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiDelete(`/projects/node/${id}`);
            if (selectedId === id) setSelectedId(null);
            await loadTree();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleClone = async () => {
        if (!githubUrl.trim()) return;

        setCloning(true);
        try {
            await apiPost("/projects/clone", {
                githubLink: githubUrl.trim(),
                deploymentLink: deploymentUrl.trim(),
                parentId: null
            });
            setGithubUrl("");
            setDeploymentUrl("");
            await loadTree();
        } catch (err) {
            console.error("Clone failed:", err);
            alert(err.message || "Clone failed");
        }
        setCloning(false);
    };

    const getFileIcon = (name, type) => {
        if (type === "folder") {
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#f0c36d" stroke="none">
                    <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
            );
        }

        const ext = name.split(".").pop().toLowerCase();
        const colors = {
            js: "#f7df1e", jsx: "#61dafb", ts: "#3178c6", tsx: "#3178c6",
            py: "#3776ab", java: "#ed8b00", html: "#e34f26", css: "#264de4",
            json: "#6d6d6d", md: "#ffffff", go: "#00add8", rs: "#ce422b",
            c: "#555555", cpp: "#f34b7d", rb: "#cc342d", php: "#777bb4"
        };

        return (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors[ext] || "#8b949e"} strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
            </svg>
        );
    };

    const renderNode = (node, depth = 0) => {
        const isExpanded = expandedIds.has(node._id);
        const isSelected = selectedId === node._id;
        const isEditing = editingId === node._id;

        return (
            <div key={node._id}>
                <div
                    className={`tree-node ${isSelected ? "selected" : ""}`}
                    style={{ paddingLeft: `${12 + depth * 20}px` }}
                    onClick={() => {
                        setSelectedId(node._id);
                        if (node.type === "folder") toggleExpand(node._id);
                    }}
                >
                    {node.type === "folder" && (
                        <span className={`tree-arrow ${isExpanded ? "expanded" : ""}`}>
                            ▸
                        </span>
                    )}

                    <span className="tree-icon">
                        {getFileIcon(node.name, node.type)}
                    </span>

                    {isEditing ? (
                        <input
                            className="tree-rename-input"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onBlur={() => handleRename(node._id)}
                            onKeyDown={e => {
                                if (e.key === "Enter") handleRename(node._id);
                                if (e.key === "Escape") { setEditingId(null); setEditName(""); }
                            }}
                            autoFocus
                            onClick={e => e.stopPropagation()}
                        />
                    ) : (
                        <span className="tree-name">{node.name}</span>
                    )}

                    <div className="tree-actions">
                        {node.type === "folder" && (
                            <>
                                <button
                                    title="New file"
                                    onClick={e => { e.stopPropagation(); setShowNewForm({ parentId: node._id, type: "file" }); setExpandedIds(prev => new Set(prev).add(node._id)); }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
                                </button>
                                <button
                                    title="New folder"
                                    onClick={e => { e.stopPropagation(); setShowNewForm({ parentId: node._id, type: "folder" }); setExpandedIds(prev => new Set(prev).add(node._id)); }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
                                </button>
                            </>
                        )}
                        <button
                            title="Rename"
                            onClick={e => { e.stopPropagation(); setEditingId(node._id); setEditName(node.name); }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                            title="Delete"
                            onClick={e => { e.stopPropagation(); handleDelete(node._id); }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                    </div>
                </div>

                {/* New item form inside folder */}
                {showNewForm && showNewForm.parentId === node._id && isExpanded && (
                    <div className="tree-new-form" style={{ paddingLeft: `${32 + depth * 20}px` }}>
                        <span className="tree-icon">
                            {showNewForm.type === "folder" ? getFileIcon("", "folder") : getFileIcon("file.txt", "file")}
                        </span>
                        <input
                            className="tree-rename-input"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") handleCreate();
                                if (e.key === "Escape") { setShowNewForm(null); setNewName(""); }
                            }}
                            placeholder={`New ${showNewForm.type}...`}
                            autoFocus
                        />
                    </div>
                )}

                {/* Children */}
                {node.type === "folder" && isExpanded && node.children && (
                    <div className="tree-children">
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <span className="admin-login-spinner" />
                <p>Loading project tree...</p>
            </div>
        );
    }

    return (
        <div className="project-tree-container">
            {/* GitHub clone section */}
            <div className="project-clone-section">
                <h3 className="profile-section-title">Clone GitHub Repository to Tree</h3>
                <div className="profile-fields-grid" style={{ marginBottom: "12px" }}>
                    <div>
                        <label className="profile-field-label">GitHub Repository URL</label>
                        <input
                            type="url"
                            value={githubUrl}
                            onChange={e => setGithubUrl(e.target.value)}
                            placeholder="https://github.com/user/repo.git"
                            className="profile-field-input"
                        />
                    </div>
                    <div>
                        <label className="profile-field-label">Deployment / Live URL (Optional for RUN btn)</label>
                        <input
                            type="url"
                            value={deploymentUrl}
                            onChange={e => setDeploymentUrl(e.target.value)}
                            placeholder="https://my-app.vercel.app"
                            className="profile-field-input"
                        />
                    </div>
                </div>

                <button
                    className="project-clone-btn"
                    onClick={handleClone}
                    disabled={cloning || !githubUrl.trim()}
                >
                    {cloning ? (
                        <span className="admin-login-spinner" />
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Clone Repo to Tree & Showcase
                        </>
                    )}
                </button>
            </div>

            {/* Tree toolbar */}
            <div className="project-tree-toolbar">
                <h3 className="profile-section-title">File Tree Structure</h3>
                <div className="project-tree-toolbar-actions">
                    <button
                        className="profile-add-btn"
                        onClick={() => setShowNewForm({ parentId: null, type: "folder" })}
                    >
                        + New Folder
                    </button>
                    <button
                        className="profile-add-btn"
                        onClick={() => setShowNewForm({ parentId: null, type: "file" })}
                    >
                        + New File
                    </button>
                </div>
            </div>

            {/* Tree view */}
            <div className="project-tree">
                {/* Root level new form */}
                {showNewForm && showNewForm.parentId === null && (
                    <div className="tree-new-form" style={{ paddingLeft: "12px" }}>
                        <span className="tree-icon">
                            {showNewForm.type === "folder" ? getFileIcon("", "folder") : getFileIcon("file.txt", "file")}
                        </span>
                        <input
                            className="tree-rename-input"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") handleCreate();
                                if (e.key === "Escape") { setShowNewForm(null); setNewName(""); }
                            }}
                            placeholder={`New ${showNewForm.type}...`}
                            autoFocus
                        />
                    </div>
                )}

                {tree.map(node => renderNode(node, 0))}

                {tree.length === 0 && !showNewForm && (
                    <div className="project-tree-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        <p>No projects yet</p>
                        <p className="project-tree-empty-hint">Clone a GitHub repo or create folders manually</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectTree;
