import { useEffect, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { AudioProvider } from "./context/AudioContext";
import BootScreen from "./components/boot/BootScreen";
import ModeSelect from "./components/mode/ModeSelect";
import ViewOS from "./screens/ViewOS";

function App() {
    const [screen, setScreen] = useState("boot");
    const [mode, setMode] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setScreen("mode-select");
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleModeSelect = (selectedMode) => {
        setMode(selectedMode);
        setScreen("view-os");
    };

    const handleBack = () => {
        setMode(null);
        setScreen("mode-select");
    };

    if (screen === "boot") {
        return <BootScreen />;
    }

    if (screen === "mode-select") {
        return <ModeSelect onSelect={handleModeSelect} />;
    }

    if (screen === "view-os") {
        return (
            <AuthProvider>
                <AudioProvider>
                    <ViewOS mode={mode} onBack={handleBack} />
                </AudioProvider>
            </AuthProvider>
        );
    }

    return null;
}

export default App;