import { createContext, useContext, useState, useEffect, useRef } from "react";
import { apiGet } from "../hooks/useApi";

const AudioContext = createContext(null);

// Royalty-free demo sample tracks if admin hasn't uploaded any tracks yet
const SAMPLE_TRACKS = [
    {
        _id: "demo-1",
        title: "Synthwave Dreams",
        artist: "Arju",
        album: "Portfolio OS Beats",
        audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
        coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
        duration: 145
    },
    {
        _id: "demo-2",
        title: "Midnight Coding Lofi",
        artist: "Arju",
        album: "Night Shift",
        audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
        coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
        duration: 168
    },
    {
        _id: "demo-3",
        title: "Cyberpunk Horizon",
        artist: "Arju",
        album: "Neon City",
        audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a7092b.mp3?filename=chill-abstract-intention-12099.mp3",
        coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
        duration: 190
    }
];

export function AudioProvider({ children }) {
    const audioRef = useRef(new Audio());
    const [tracks, setTracks] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoop, setIsLoop] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);

    const [trackDurations, setTrackDurations] = useState({});

    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        try {
            const res = await apiGet("/music");
            if (res.data && res.data.length > 0) {
                setTracks(res.data);
            } else {
                setTracks(SAMPLE_TRACKS);
            }
        } catch (err) {
            console.error("Failed to load music tracks:", err);
            setTracks(SAMPLE_TRACKS);
        }
    };

    const currentTrack = tracks[currentTrackIndex] || null;

    // Attach event listeners to audio object
    useEffect(() => {
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            const realDuration = audio.duration || currentTrack?.duration || 0;
            setDuration(realDuration);
            if (currentTrack?._id && realDuration > 0) {
                setTrackDurations(prev => ({
                    ...prev,
                    [currentTrack._id]: realDuration
                }));
            }
        };

        const handleEnded = () => {
            if (isLoop) {
                audio.currentTime = 0;
                audio.play().catch(e => console.warn(e));
            } else {
                nextTrack();
            }
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [currentTrackIndex, tracks, isLoop, isShuffle]);

    // Handle track source change
    useEffect(() => {
        if (!currentTrack) return;
        const audio = audioRef.current;

        let src = currentTrack.audioUrl;

        const wasPlaying = isPlaying;
        if (audio.src !== src) {
            audio.src = src;
            audio.load();
            if (wasPlaying) {
                audio.play().catch(err => console.warn("Auto-play blocked:", err));
            }
        }
    }, [currentTrackIndex, tracks]);

    // Volume update
    useEffect(() => {
        audioRef.current.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    const playTrack = (index) => {
        if (index >= 0 && index < tracks.length) {
            setCurrentTrackIndex(index);
            setIsPlaying(true);

            let src = tracks[index].audioUrl;

            const audio = audioRef.current;
            audio.src = src;
            audio.play().then(() => {
                setIsPlaying(true);
            }).catch(err => console.warn("Play error:", err));
        }
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio.src && tracks.length > 0) {
            playTrack(0);
            return;
        }

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().then(() => {
                setIsPlaying(true);
            }).catch(err => console.warn("Play error:", err));
        }
    };

    const nextTrack = () => {
        if (tracks.length === 0) return;
        let nextIdx;
        if (isShuffle) {
            nextIdx = Math.floor(Math.random() * tracks.length);
        } else {
            nextIdx = (currentTrackIndex + 1) % tracks.length;
        }
        playTrack(nextIdx);
    };

    const prevTrack = () => {
        if (tracks.length === 0) return;
        const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        playTrack(prevIdx);
    };

    const seekTo = (seconds) => {
        if (audioRef.current) {
            audioRef.current.currentTime = seconds;
            setCurrentTime(seconds);
        }
    };

    const setVolumeLevel = (val) => {
        setVolume(val);
        if (val > 0) setIsMuted(false);
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    const toggleLoop = () => {
        setIsLoop(prev => !prev);
    };

    const toggleShuffle = () => {
        setIsShuffle(prev => !prev);
    };

    return (
        <AudioContext.Provider
            value={{
                tracks,
                currentTrack,
                currentTrackIndex,
                isPlaying,
                currentTime,
                duration,
                volume,
                isMuted,
                isLoop,
                isShuffle,
                trackDurations,
                playTrack,
                togglePlay,
                nextTrack,
                prevTrack,
                seekTo,
                setVolumeLevel,
                toggleMute,
                toggleLoop,
                toggleShuffle,
                loadTracks
            }}
        >
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error("useAudio must be used within an AudioProvider");
    }
    return context;
}
