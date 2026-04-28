"use client";
import { useState } from "react";
import { toast } from "sonner";

interface Props { role: string; score: number; level?: string; interviewType?: string; }

export default function ShareResultCard({ role, score, level, interviewType }: Props) {
    const [copied, setCopied] = useState(false);
    const emoji = score>=85?"🏆":score>=70?"🎯":score>=50?"📈":"💪";
    const message = `${emoji} Just completed an AI mock interview for ${role}${level?` (${level})`:""}${interviewType?` — ${interviewType}`:""} and scored ${score}%!\n\nPracticing with Intvu AI Interview Platform to get job-ready. 🚀\n\n#InterviewPrep #JobSearch #AI`;

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(message);
            setCopied(true); toast.success("Copied to clipboard! Share it anywhere 🚀");
            setTimeout(() => setCopied(false), 3000);
        } catch { toast.error("Could not copy."); }
    }
    function linkedIn() { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://ai-interview-agent-tau.vercel.app")}&summary=${encodeURIComponent(message)}`,"_blank","noopener"); }
    function twitter() { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,"_blank","noopener"); }

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">📣 Share Your Result</h3>
            <div className="bg-gradient-to-br from-blue-600/10 to-teal-600/5 border border-blue-500/20 rounded-lg p-4 mb-4">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{message}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-blue-500/50 text-gray-400 hover:text-white rounded-lg text-xs transition-colors">
                    {copied?"✅ Copied!":"📋 Copy Text"}
                </button>
                <button onClick={linkedIn} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0077B5]/20 border border-[#0077B5]/40 text-[#0077B5] hover:bg-[#0077B5]/30 rounded-lg text-xs transition-colors">💼 LinkedIn</button>
                <button onClick={twitter} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 rounded-lg text-xs transition-colors">𝕏 Twitter</button>
            </div>
        </div>
    );
}
