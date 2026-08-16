import { useState } from "react";

function FullscreenPrompt({ onClose }) {
    const handleYes = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn("Fullscreen request error:", err);
            });
        }
        onClose();
    };

    const handleNo = () => {
        onClose();
    };

    return (
        <div className="fullscreen-overlay">
            <div className="fullscreen-modal">
                <div className="fs-glow-ring" />
                <div className="fs-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <path d="M8 21h8M12 17v4"/>
                    </svg>
                </div>

                <h2 className="fs-title">Full Screen Experience</h2>
                <p className="fs-subtitle">
                    Would you like to enter <strong>Full Screen Mode</strong> for the ultimate interactive Operating System experience?
                </p>

                <div className="fs-actions">
                    <button className="fs-btn fs-btn-primary" onClick={handleYes}>
                        <span>Yes, Let's Go</span>
                    </button>

                    <button className="fs-btn fs-btn-secondary" onClick={handleNo}>
                        <span>Continue in window</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FullscreenPrompt;

