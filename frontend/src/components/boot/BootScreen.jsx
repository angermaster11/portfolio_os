function BootScreen() {
    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden">

            <div className="relative w-full h-screen flex flex-col items-center justify-center">

                {/* Ambient glow */}
                <div className="absolute w-72 h-72 bg-white/5 blur-[120px] rounded-full" />

                {/* Logo */}
                <div className="relative text-center boot-content">

                    <p className="text-[10px] tracking-[0.6em] uppercase text-zinc-600 mb-5">
                        System
                    </p>

                    <h1 className="text-5xl md:text-6xl font-semibold tracking-[0.18em]">
                        PORTFOLIO
                    </h1>

                    <h2 className="mt-2 text-xl md:text-2xl tracking-[0.65em] text-zinc-500">
                        OS
                    </h2>

                </div>

                {/* Loader */}
                <div className="absolute bottom-24 flex flex-col items-center gap-4">

                    <div className="flex gap-2">
                        <span className="boot-dot" />
                        <span className="boot-dot boot-dot-delay-1" />
                        <span className="boot-dot boot-dot-delay-2" />
                    </div>

                    <p className="text-xs tracking-[0.3em] uppercase text-zinc-600">
                        Initializing
                    </p>

                </div>

                {/* Version */}
                <p className="absolute bottom-7 text-[10px] tracking-[0.3em] text-zinc-800">
                    PORTFOLIO OS · v1.0
                </p>

            </div>

        </main>
    );
}

export default BootScreen;