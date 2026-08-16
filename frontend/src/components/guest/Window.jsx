import { useState, useRef, useCallback, useEffect } from "react";

function Window({
    id, title, icon, x, y, width, height,
    minimized, maximized, zIndex, isActive,
    onClose, onMinimize, onMaximize, onFocus, onMove, onResize,
    children
}) {
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

    // Drag
    const handleMouseDown = useCallback((e) => {
        if (maximized) return;
        e.preventDefault();
        onFocus();
        dragOffset.current = { x: e.clientX - x, y: e.clientY - y };
        setDragging(true);
    }, [x, y, maximized, onFocus]);

    useEffect(() => {
        if (!dragging) return;

        const handleMouseMove = (e) => {
            onMove(
                e.clientX - dragOffset.current.x,
                e.clientY - dragOffset.current.y
            );
        };

        const handleMouseUp = () => setDragging(false);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging, onMove]);

    // Resize
    const handleResizeStart = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        onFocus();
        resizeStart.current = { x: e.clientX, y: e.clientY, w: width, h: height };
        setResizing(true);
    }, [width, height, onFocus]);

    useEffect(() => {
        if (!resizing) return;

        const handleMouseMove = (e) => {
            const dx = e.clientX - resizeStart.current.x;
            const dy = e.clientY - resizeStart.current.y;
            onResize(
                Math.max(350, resizeStart.current.w + dx),
                Math.max(250, resizeStart.current.h + dy)
            );
        };

        const handleMouseUp = () => setResizing(false);

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [resizing, onResize]);

    if (minimized) return null;

    const style = maximized
        ? { top: 0, left: 0, width: "100%", height: "calc(100vh - 52px)", zIndex, borderRadius: 0 }
        : { top: y, left: x, width, height, zIndex };

    return (
        <div
            className={`window ${isActive ? "active" : ""} ${maximized ? "maximized" : ""}`}
            style={style}
            onMouseDown={onFocus}
        >
            {/* Title bar */}
            <div className="window-titlebar" onMouseDown={handleMouseDown}>
                <div className="window-titlebar-left">
                    <span className="window-icon">{icon}</span>
                    <span className="window-title">{title}</span>
                </div>

                <div className="window-controls">
                    <button
                        className="window-control window-minimize"
                        onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                        title="Minimize"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </button>

                    <button
                        className="window-control window-maximize"
                        onClick={(e) => { e.stopPropagation(); onMaximize(); }}
                        title="Maximize"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" rx="1" />
                        </svg>
                    </button>

                    <button
                        className="window-control window-close"
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        title="Close"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="window-content">
                {children}
            </div>

            {/* Resize handle */}
            {!maximized && (
                <div
                    className="window-resize-handle"
                    onMouseDown={handleResizeStart}
                />
            )}
        </div>
    );
}

export default Window;
