import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminLogin from "../components/admin/AdminLogin";
import AdminPanel from "../components/admin/AdminPanel";
import Desktop from "../components/guest/Desktop";

function ViewOS({ mode, onBack }) {
    const { isAuthenticated, logout } = useAuth();
    const [adminAuthed, setAdminAuthed] = useState(false);

    if (mode === "guest") {
        return <Desktop onBack={onBack} />;
    }

    if (mode === "admin") {
        if (isAuthenticated || adminAuthed) {
            return (
                <AdminPanel
                    onLogout={() => {
                        logout();
                        setAdminAuthed(false);
                        onBack();
                    }}
                />
            );
        }

        return (
            <AdminLogin
                onLoginSuccess={() => setAdminAuthed(true)}
                onBack={onBack}
            />
        );
    }

    return null;
}

export default ViewOS;