import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { apiGet } from "../../hooks/useApi";

function FileManager() {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState([]);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [viewFile, setViewFile] = useState(null);

    useEffect(() => {
        loadTree();
    }, []);

    const loadTree = async () => {
        try {
            const data = await apiGet("/projects/tree");
            setTree(data.data || []);
        } catch (err) {
            console.error("Failed to load project tree:", err);
        }
        setLoading(false);
    };

    const getCurrentItems = () => {
        if (currentPath.length === 0) return tree;

        let items = tree;
        for (const pathItem of currentPath) {
            const folder = items.find(i => String(i._id) === String(pathItem.id));
            if (folder && folder.children) {
                items = folder.children;
            } else {
                return [];
            }
        }
        return items;
    };

    const navigateToFolder = (folder) => {
        setCurrentPath(prev => [...prev, { id: folder._id, name: folder.name }]);
    };

    const navigateToIndex = (index) => {
        setCurrentPath(prev => prev.slice(0, index + 1));
    };

    const navigateUp = () => {
        setCurrentPath(prev => prev.slice(0, -1));
    };

    const toggleSidebarExpand = (id) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const getFileIcon = (name, type) => {
        if (type === "folder") return "📁";
        const ext = name.split(".").pop().toLowerCase();
        const icons = {
            js: "📜", jsx: "⚛️", ts: "📘", tsx: "⚛️",
            py: "🐍", html: "🌐", css: "🎨", json: "📋",
            md: "📝", go: "🐹", rs: "🦀", java: "☕",
            c: "⚙️", cpp: "⚙️", rb: "💎", php: "🐘",
            png: "🖼️", jpg: "🖼️", svg: "🖼️", gif: "🖼️",
            txt: "📄", yml: "⚙️", yaml: "⚙️", toml: "⚙️"
        };
        return icons[ext] || "📄";
    };

    const handleItemDoubleClick = (item) => {
        if (item.type === "folder") {
            navigateToFolder(item);
        } else {
            setViewFile(item);
        }
    };

    const renderSidebarTree = (nodes, depth = 0) => {
        return nodes.filter(n => n.type === "folder").map(node => {
            const isExpanded = expandedIds.has(node._id);
            return (
                <div key={node._id}>
                    <button
                        className="fm-sidebar-item"
                        style={{ paddingLeft: `${8 + depth * 16}px` }}
                        onClick={() => {
                            toggleSidebarExpand(node._id);

                            const path = [];
                            const findPath = (nodes, target, current) => {
                                for (const n of nodes) {
                                    if (String(n._id) === String(target)) {
                                        path.push(...current, { id: n._id, name: n.name });
                                        return true;
                                    }
                                    if (n.children && findPath(n.children, target, [...current, { id: n._id, name: n.name }])) {
                                        return true;
                                    }
                                }
                                return false;
                            };
                            findPath(tree, node._id, []);
                            setCurrentPath(path);
                        }}
                    >
                        <span className={`fm-sidebar-arrow ${isExpanded ? "expanded" : ""}`}>▸</span>
                        <span>📁</span>
                        <span className="fm-sidebar-name">{node.name}</span>
                    </button>
                    {isExpanded && node.children && (
                        <div>{renderSidebarTree(node.children, depth + 1)}</div>
                    )}
                </div>
            );
        });
    };

    const items = getCurrentItems();

    if (loading) {
        return (
            <div className="fm-loading">
                <div className="fm-spinner" />
                <p>Loading files...</p>
            </div>
        );
    }

    return (
        <div className="file-manager">
            {/* Sidebar */}
            <div className="fm-sidebar">
                <div className="fm-sidebar-header">
                    <span>📂 Quick Access</span>
                </div>
                <button
                    className={`fm-sidebar-item ${currentPath.length === 0 ? "active" : ""}`}
                    onClick={() => setCurrentPath([])}
                >
                    <span>🏠</span>
                    <span className="fm-sidebar-name">Root</span>
                </button>
                {renderSidebarTree(tree)}
            </div>

            {/* Main area */}
            <div className="fm-main">
                {/* Toolbar */}
                <div className="fm-toolbar">
                    <button
                        className="fm-toolbar-btn"
                        onClick={navigateUp}
                        disabled={currentPath.length === 0}
                        title="Go up"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>

                    {/* Breadcrumb */}
                    <div className="fm-breadcrumb">
                        <button
                            className="fm-breadcrumb-item"
                            onClick={() => setCurrentPath([])}
                        >
                            Root
                        </button>
                        {currentPath.map((p, i) => (
                            <span key={p.id}>
                                <span className="fm-breadcrumb-sep">/</span>
                                <button
                                    className="fm-breadcrumb-item"
                                    onClick={() => navigateToIndex(i)}
                                >
                                    {p.name}
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Files grid */}
                <div className="fm-files">
                    {items.length === 0 ? (
                        <div className="fm-empty">
                            <span style={{ fontSize: "48px", opacity: 0.3 }}>📂</span>
                            <p>This folder is empty</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <button
                                key={item._id}
                                className="fm-file-item"
                                onDoubleClick={() => handleItemDoubleClick(item)}
                            >
                                <span className="fm-file-icon">
                                    {getFileIcon(item.name, item.type)}
                                </span>
                                <span className="fm-file-name">{item.name}</span>
                            </button>
                        ))
                    )}
                </div>

                {/* Status bar */}
                <div className="fm-statusbar">
                    <span>{items.length} items</span>
                    {currentPath.length > 0 && (
                        <span> | Path: /{currentPath.map(p => p.name).join("/")}</span>
                    )}
                </div>
            </div>

            {/* File Viewer Modal */}
            {viewFile && (
                <div className="fm-viewer-overlay" onClick={() => setViewFile(null)}>
                    <div className="fm-viewer-modal" onClick={e => e.stopPropagation()}>
                        <div className="fm-viewer-header">
                            <span>📄 {viewFile.name}</span>
                            <button onClick={() => setViewFile(null)}>✕</button>
                        </div>
                        <div className="fm-viewer-body">
                            {viewFile.name.toLowerCase().endsWith(".md") || viewFile.name.toLowerCase().includes("readme") ? (
                                <div className="markdown-preview">
                                    <ReactMarkdown>{viewFile.content || "*Empty README document.*"}</ReactMarkdown>
                                </div>
                            ) : (
                                <pre className="fm-viewer-content">
                                    {viewFile.content || "// No preview text available for this file."}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FileManager;
