"use client";
import { useEffect, useState, useCallback } from "react";

interface Props { durationMinutes?: number; onTimeUp?: () => void; }

function fmt(s: number) {
    return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
}

export default function InterviewTimer({ durationMinutes = 30, onTimeUp }: Props) {
    const total = durationMinutes * 60;
    const [elapsed, setElapsed] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const remaining = total - elapsed;
    const progress = Math.min((elapsed/total)*100, 100);
    const isWarning = remaining <= 300 && remaining > 60;
    const isDanger = remaining <= 60;
    const barColor = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#43d9ad";

    const handleTimeUp = useCallback(() => { if (onTimeUp) onTimeUp(); }, [onTimeUp]);

    useEffect(() => {
        if (isPaused || elapsed >= total) { if (elapsed >= total) handleTimeUp(); return; }
        const id = setInterval(() => setElapsed(p => p + 1), 1000);
        return () => clearInterval(id);
    }, [isPaused, elapsed, total, handleTimeUp]);

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 w-full">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span>⏱️</span><span className="text-gray-400 text-sm font-medium">Time</span></div>
                <div className="flex items-center gap-3">
                    <span className={`font-mono text-lg font-bold ${isDanger?"text-red-400 animate-pulse":isWarning?"text-yellow-400":"text-white"}`}>{fmt(remaining)}</span>
                    <button onClick={() => setIsPaused(p=>!p)} className="text-xs text-gray-500 hover:text-gray-300 border border-gray-600 rounded px-2 py-0.5">
                        {isPaused ? "▶ Resume" : "⏸ Pause"}
                    </button>
                </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all duration-1000" style={{ width:`${progress}%`, backgroundColor: barColor }}/>
            </div>
            <div className="flex justify-between mt-1">
                <span className="text-gray-600 text-xs">{fmt(elapsed)} elapsed</span>
                <span className="text-gray-600 text-xs">{durationMinutes}m session</span>
            </div>
            {isDanger && <p className="text-red-400 text-xs text-center mt-2 animate-pulse">⚠️ Less than 1 minute remaining!</p>}
        </div>
    );
}
