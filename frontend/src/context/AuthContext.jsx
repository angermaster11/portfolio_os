import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        () => localStorage.getItem("portfolio_token") || null
    );

    const [user, setUser] = useState(
        () => {
            const stored = localStorage.getItem("portfolio_user");
            return stored ? JSON.parse(stored) : null;
        }
    );

    const login = useCallback((newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("portfolio_token", newToken);
        localStorage.setItem("portfolio_user", JSON.stringify(userData));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("portfolio_token");
        localStorage.removeItem("portfolio_user");
    }, []);

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider
            value={{ token, user, login, logout, isAuthenticated }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}
