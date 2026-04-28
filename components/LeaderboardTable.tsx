"use client";

export interface LeaderboardEntry {
    userId: string; displayName: string; avatarInitial: string;
    avgScore: number; interviewCount: number; bestScore: number; topRole: string;
}
interface Props { entries: LeaderboardEntry[]; currentUserId: string; }

const MEDALS = ["🥇","🥈","🥉"];
function scoreColor(s: number) { return s>=80?"text-green-400":s>=60?"text-yellow-400":"text-red-400"; }

export default function LeaderboardTable({ entries, currentUserId }: Props) {
    if (!entries || entries.length === 0) return (
        <div className="text-center py-20">
            <span className="text-5xl">🏆</span>
            <p className="text-gray-400 mt-4">No scores yet. Be the first to complete an interview!</p>
        </div>
    );

    return (
        <div className="space-y-3">
            {entries.map((entry, idx) => {
                const isMe = entry.userId === currentUserId;
                const rank = idx + 1;
                return (
                    <div key={entry.userId} className={`flex items-center gap-4 bg-black/40 border rounded-xl px-5 py-4 transition-colors ${isMe?"border-blue-500 ring-1 ring-blue-500/30":"border-white/10"}`}>
                        <div className="w-10 text-center">
                            {rank<=3 ? <span className="text-xl">{MEDALS[rank-1]}</span> : <span className="text-gray-500 font-mono text-sm">#{rank}</span>}
                        </div>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isMe?"bg-blue-600 text-white":"bg-white/10 text-gray-300"}`}>
                            {entry.avatarInitial.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-white font-medium truncate">{entry.displayName}</p>
                                {isMe && <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">You</span>}
                            </div>
                            <p className="text-gray-500 text-xs truncate">{entry.topRole}</p>
                        </div>
                        <div className="hidden sm:flex gap-6 text-center">
                            <div><p className={`font-bold text-lg ${scoreColor(entry.avgScore)}`}>{entry.avgScore}%</p><p className="text-gray-600 text-xs">Avg</p></div>
                            <div><p className="text-white font-bold text-lg">{entry.bestScore}%</p><p className="text-gray-600 text-xs">Best</p></div>
                            <div><p className="text-white font-bold text-lg">{entry.interviewCount}</p><p className="text-gray-600 text-xs">Interviews</p></div>
                        </div>
                        <div className="sm:hidden"><p className={`font-bold text-lg ${scoreColor(entry.avgScore)}`}>{entry.avgScore}%</p></div>
                    </div>
                );
            })}
        </div>
    );
}
