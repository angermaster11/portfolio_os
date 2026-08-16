import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiPost } from "../../hooks/useApi";
import "./admin.css";

function AdminLogin({ onLoginSuccess }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [focused, setFocused] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await apiPost("/auth/login", {
                username: "anger",
                password
            });

            login(data.token, data.user);

            // Brief success animation before transitioning
            setTimeout(() => {
                onLoginSuccess();
            }, 600);
        } catch (err) {
            setError(err.message || "Authentication failed");
            setShake(true);
            setTimeout(() => setShake(false), 600);
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            {/* Animated grid background */}
            <div className="admin-login-grid" />

            {/* Floating particles */}
            <div className="admin-login-particles">
                {Array.from({ length: 20 }).map((_, i) => (
                    <span
                        key={i}
                        className="admin-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    />
                ))}
            </div>

            <div className={`admin-login-card ${shake ? "shake" : ""}`}>
                {/* Avatar */}
                <div className="admin-avatar">
                    <div className="admin-avatar-ring" />
                    <div className="admin-avatar-inner">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <rect
                                x="5"
                                y="10"
                                width="14"
                                height="10"
                                rx="2"
                            />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                            <circle cx="12" cy="15" r="1" />
                        </svg>
                    </div>
                </div>

                {/* Username display */}
                <div className="admin-username-display">
                    <span className="admin-username-label">Administrator</span>
                    <span className="admin-username-value">anger</span>
                </div>

                {/* Password form */}
                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div
                        className={`admin-password-wrapper ${
                            focused ? "focused" : ""
                        }`}
                    >
                        <svg
                            className="admin-password-icon"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            placeholder="Enter password"
                            className="admin-password-input"
                            autoFocus
                            disabled={loading}
                        />

                        <div className="admin-password-glow" />
                    </div>

                    {error && (
                        <div className="admin-login-error">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={loading || !password}
                    >
                        {loading ? (
                            <span className="admin-login-spinner" />
                        ) : (
                            <>
                                <span>Authenticate</span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <p className="admin-login-hint">
                    Press Enter to authenticate
                </p>
            </div>
        </div>
    );
}

export default AdminLogin;
