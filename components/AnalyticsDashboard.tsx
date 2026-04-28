"use client";
import { useMemo } from "react";
import dayjs from "dayjs";

interface CategoryScore { name: string; score: number; comment: string; }
interface Interview {
    id: string; role: string; type: string; createdAt: string;
    feedback?: { totalScore: number; categoryScores: CategoryScore[]; finalAssessment: string; };
}
interface Props { interviews: Interview[]; }

const COLORS = ["#6c63ff","#43d9ad","#f59e0b","#ef4444","#3b82f6","#ec4899"];

function ScoreBar({ score, color }: { score: number; color: string }) {
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="h-2.5 rounded-full transition-all duration-700" style={{ width:`${score}%`, backgroundColor:color }} />
        </div>
    );
}
function StatCard({ title, value, sub, icon }: { title:string; value:string|number; sub?:string; icon:string }) {
    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-5 flex items-center gap-4">
            <div className="text-3xl">{icon}</div>
            <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
                {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function AnalyticsDashboard({ interviews }: Props) {
    const completed = useMemo(() => interviews.filter(i => i.feedback), [interviews]);
    const avgScore = useMemo(() => {
        if (!completed.length) return 0;
        return Math.round(completed.reduce((s, i) => s + (i.feedback?.totalScore ?? 0), 0) / completed.length);
    }, [completed]);
    const bestScore = useMemo(() => completed.reduce((b, i) => Math.max(b, i.feedback?.totalScore ?? 0), 0), [completed]);

    const categoryAvgs = useMemo(() => {
        const map: Record<string, { total:number; count:number }> = {};
        completed.forEach(i => i.feedback?.categoryScores?.forEach(c => {
            if (!map[c.name]) map[c.name] = { total:0, count:0 };
            map[c.name].total += c.score; map[c.name].count += 1;
        }));
        return Object.entries(map).map(([name, {total,count}]) => ({ name, avg: Math.round(total/count) }));
    }, [completed]);

    const recentScores = useMemo(() =>
        completed.slice(-6).map(i => ({ date: dayjs(i.createdAt).format("MMM D"), score: i.feedback?.totalScore ?? 0 })),
    [completed]);

    const typeDist = useMemo(() => {
        const map: Record<string,number> = {};
        interviews.forEach(i => { map[i.type] = (map[i.type] ?? 0) + 1; });
        return Object.entries(map).map(([type,count]) => ({ type, count }));
    }, [interviews]);

    if (interviews.length === 0) return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">📊</span>
            <h2 className="text-white text-2xl font-semibold mb-2">No Data Yet</h2>
            <p className="text-gray-400">Complete your first interview to see analytics here.</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Interviews" value={interviews.length} icon="🎙️" />
                <StatCard title="Completed" value={completed.length} sub="with feedback" icon="✅" />
                <StatCard title="Average Score" value={avgScore ? `${avgScore}%` : "—"} icon="📈" />
                <StatCard title="Best Score" value={bestScore ? `${bestScore}%` : "—"} icon="🏆" />
            </div>

            {recentScores.length > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                    <h2 className="text-white font-semibold text-lg mb-5">📈 Score Trend (Last {recentScores.length} Interviews)</h2>
                    <div className="flex items-end gap-3 h-36">
                        {recentScores.map((e, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-400 font-mono">{e.score}%</span>
                                <div className="w-full rounded-t-md transition-all duration-700"
                                    style={{ height:`${(e.score/100)*112}px`, backgroundColor: e.score>=75?"#43d9ad":e.score>=50?"#f59e0b":"#ef4444", minHeight:"4px" }} />
                                <span className="text-xs text-gray-500">{e.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {categoryAvgs.length > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                    <h2 className="text-white font-semibold text-lg mb-5">🎯 Category Performance</h2>
                    <div className="space-y-4">
                        {categoryAvgs.map((c, i) => (
                            <div key={c.name}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-300 text-sm">{c.name}</span>
                                    <span className="text-sm font-semibold" style={{ color: COLORS[i % COLORS.length] }}>{c.avg}%</span>
                                </div>
                                <ScoreBar score={c.avg} color={COLORS[i % COLORS.length]} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {typeDist.length > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                    <h2 className="text-white font-semibold text-lg mb-4">🗂️ Interview Types</h2>
                    <div className="flex flex-wrap gap-3">
                        {typeDist.map(({type,count}, i) => (
                            <div key={type} className="flex items-center gap-2 px-4 py-2 rounded-full border"
                                style={{ borderColor: COLORS[i%COLORS.length], color: COLORS[i%COLORS.length] }}>
                                <span className="capitalize font-medium">{type}</span>
                                <span className="bg-gray-700 text-white text-xs rounded-full px-2 py-0.5">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {avgScore > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                    <h2 className="text-white font-semibold text-lg mb-3">💡 Quick Insights</h2>
                    {avgScore < 50 && <p className="text-yellow-400 text-sm">Your average is below 50%. Focus on fundamentals and practice daily — consistency is key!</p>}
                    {avgScore >= 50 && avgScore < 75 && <p className="text-blue-400 text-sm">Good progress! Work on your weakest category to make a big jump.</p>}
                    {avgScore >= 75 && <p className="text-green-400 text-sm">Excellent! You&apos;re scoring 75%+. Keep refining edge cases and communication clarity.</p>}
                    {categoryAvgs.length > 0 && (
                        <p className="text-gray-400 text-sm mt-2">
                            Weakest area: <span className="text-red-400 font-semibold">{categoryAvgs.reduce((a,b) => a.avg<b.avg?a:b).name}</span> — give it extra attention.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
