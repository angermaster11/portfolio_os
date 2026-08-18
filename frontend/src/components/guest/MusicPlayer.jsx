import { useState } from "react";
import { useAudio } from "../../context/AudioContext";

function MusicPlayer() {
    const {
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
        toggleShuffle
    } = useAudio();

    const [showPlaylist, setShowPlaylist] = useState(true);

    const formatTime = (secs) => {
        if (isNaN(secs) || secs === undefined || secs === null) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    const getCoverSrc = (track) => {
        if (!track || !track.coverUrl) {
            return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
        }
        if (track.coverUrl.startsWith("/uploads")) {
            return track.coverUrl;
        }
        return track.coverUrl;
    };

    return (
        <div className="music-player-app">
            {/* Background Glow Overlay */}
            <div className="mp-bg-glow" style={{ backgroundImage: `url(${getCoverSrc(currentTrack)})` }} />

            <div className="mp-container">
                {/* Left Side: Main Vinyl & Player Controls */}
                <div className="mp-main-player">
                    {/* Vinyl / Cover Art Container */}
                    <div className="mp-art-container">
                        <div className={`mp-vinyl-disc ${isPlaying ? "spinning" : ""}`}>
                            <div className="mp-vinyl-center" />
                        </div>
                        <img
                            src={getCoverSrc(currentTrack)}
                            alt={currentTrack?.title || "Album Cover"}
                            className={`mp-cover-art ${isPlaying ? "playing-pulse" : ""}`}
                        />
                        {isPlaying && (
                            <div className="mp-equalizer">
                                <span className="eq-bar eq-1" />
                                <span className="eq-bar eq-2" />
                                <span className="eq-bar eq-3" />
                                <span className="eq-bar eq-4" />
                            </div>
                        )}
                    </div>

                    {/* Track Info */}
                    <div className="mp-track-details">
                        <h2 className="mp-track-title">{currentTrack?.title || "No Track Loaded"}</h2>
                        <p className="mp-track-subtitle">
                            {currentTrack?.artist || "Artist"} • {currentTrack?.album || "Album"}
                        </p>
                    </div>

                    {/* Progress Bar & Timestamps */}
                    <div className="mp-progress-section">
                        <span className="mp-time">{formatTime(currentTime)}</span>
                        <div className="mp-slider-container">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime || 0}
                                onChange={(e) => seekTo(Number(e.target.value))}
                                className="mp-seek-slider"
                                style={{
                                    background: `linear-gradient(to right, #3568e8 0%, #3568e8 ${progressPercentage}%, rgba(255, 255, 255, 0.15) ${progressPercentage}%, rgba(255, 255, 255, 0.15) 100%)`
                                }}
                            />
                        </div>
                        <span className="mp-time">{formatTime(duration)}</span>
                    </div>

                    {/* Main Controls Bar */}
                    <div className="mp-controls-bar">
                        <button
                            className={`mp-ctrl-btn ${isShuffle ? "active" : ""}`}
                            onClick={toggleShuffle}
                            title="Shuffle"
                        >
                            🔀
                        </button>

                        <button className="mp-ctrl-btn mp-nav-btn" onClick={prevTrack} title="Previous Track">
                            ⏮
                        </button>

                        <button className="mp-play-main-btn" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? "⏸" : "▶"}
                        </button>

                        <button className="mp-ctrl-btn mp-nav-btn" onClick={nextTrack} title="Next Track">
                            ⏭
                        </button>

                        <button
                            className={`mp-ctrl-btn ${isLoop ? "active" : ""}`}
                            onClick={toggleLoop}
                            title="Repeat Track"
                        >
                            🔁
                        </button>
                    </div>

                    {/* Bottom Volume & Toggle Playlist */}
                    <div className="mp-bottom-bar">
                        <div className="mp-volume-group">
                            <button className="mp-vol-btn" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
                                {isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => setVolumeLevel(Number(e.target.value))}
                                className="mp-volume-slider"
                            />
                        </div>

                        <button
                            className={`mp-playlist-toggle-btn ${showPlaylist ? "active" : ""}`}
                            onClick={() => setShowPlaylist(prev => !prev)}
                        >
                            📑 Playlist ({tracks.length})
                        </button>
                    </div>
                </div>

                {/* Right Side: Playlist Drawer */}
                {showPlaylist && (
                    <div className="mp-playlist-drawer">
                        <div className="mp-playlist-header">
                            <h3>Queue List ({tracks.length})</h3>
                        </div>

                        <div className="mp-playlist-items">
                            {tracks.map((track, idx) => {
                                const isCurrent = idx === currentTrackIndex;
                                const itemDurationSec = isCurrent
                                    ? (duration || track.duration || (trackDurations && trackDurations[track._id]) || 0)
                                    : (track.duration || (trackDurations && trackDurations[track._id]) || 0);

                                return (
                                    <div
                                        key={track._id || idx}
                                        className={`mp-playlist-item ${isCurrent ? "current" : ""}`}
                                        onClick={() => playTrack(idx)}
                                    >
                                        <div className="mp-item-thumb">
                                            <img src={getCoverSrc(track)} alt={track.title} />
                                            {isCurrent && isPlaying && (
                                                <div className="mp-mini-eq">
                                                    <span />
                                                    <span />
                                                    <span />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mp-item-info">
                                            <div className="mp-item-title">{track.title}</div>
                                            <div className="mp-item-artist">{track.artist}</div>
                                        </div>
                                        <div className="mp-item-duration">
                                            {itemDurationSec > 0 ? formatTime(itemDurationSec) : "--:--"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MusicPlayer;
