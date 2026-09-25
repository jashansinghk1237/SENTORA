import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  audioBlob?: Blob | null;
  audioUrl?: string | null;
  title?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBlob,
  audioUrl: externalUrl,
  title = "Recorded Voice Memory",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [internalUrl, setInternalUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let url: string | null = null;
    if (audioBlob) {
      url = URL.createObjectURL(audioBlob);
      setInternalUrl(url);
    } else if (externalUrl) {
      setInternalUrl(externalUrl);
    }

    return () => {
      if (url && audioBlob) {
        URL.revokeObjectURL(url);
      }
    };
  }, [audioBlob, externalUrl]);

  const activeSrc = internalUrl || externalUrl;

  const togglePlay = () => {
    if (!audioRef.current || !activeSrc) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        console.warn("Audio play failed:", e);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!activeSrc) {
    return (
      <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500">
        <Volume2 className="w-4 h-4 text-slate-400" />
        <span>No voice audio attached to this entry.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3.5 bg-sentora-50/60 dark:bg-slate-800/80 border border-sentora-200 dark:border-slate-700/80 rounded-2xl shadow-sm">
      <audio
        ref={audioRef}
        src={activeSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-sentora-900 dark:text-sentora-200">
          <Volume2 className="w-4 h-4 text-sentora-600 dark:text-sentora-400" />
          <span>{title}</span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="p-2 rounded-full bg-sentora-600 hover:bg-sentora-700 text-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sentora-500 focus:ring-offset-2"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
        </button>

        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sentora-600"
        />

        <button
          type="button"
          onClick={handleReset}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Restart audio"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
