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
                <div className="fs-icon">🖥️✨</div>

                <h2 className="fs-title">Full Screen Experience</h2>
                <p className="fs-subtitle">
                    Would you like to enter <strong>Full Screen Mode</strong> for the ultimate interactive Operating System experience?
                </p>

                <div className="fs-actions">
                    <button className="fs-btn fs-btn-primary" onClick={handleYes}>
                        <span>Yes, Let's Go! 🚀</span>
                    </button>

                    <button className="fs-btn fs-btn-secondary" onClick={handleNo}>
                        <span>No, I'm a boring person 😴</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FullscreenPrompt;
