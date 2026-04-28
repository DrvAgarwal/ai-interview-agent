"use client";
import { useState } from "react";
import { toast } from "sonner";

interface Props { userId: string; }
type Step = "setup" | "interview" | "results";
interface QnA { question: string; userAnswer: string; aiFeedback: string; score: number; }

const ROLES = ["Frontend Developer","Backend Developer","Full Stack Developer","Data Scientist","Machine Learning Engineer","DevOps Engineer","Product Manager","UI/UX Designer","Software Architect","QA Engineer"];
const TYPES = ["Technical","Behavioral","Mixed"];
const LEVELS = ["Junior","Mid-level","Senior"];

export default function PracticeMode({ userId }: Props) {
    const [step, setStep] = useState<Step>("setup");
    const [role, setRole] = useState(ROLES[0]);
    const [type, setType] = useState(TYPES[0]);
    const [level, setLevel] = useState(LEVELS[0]);
    const [questionCount, setQuestionCount] = useState(5);
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answer, setAnswer] = useState("");
    const [qnaHistory, setQnaHistory] = useState<QnA[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    async function startInterview() {
        setIsLoading(true);
        try {
            const res = await fetch("/api/practice/generate", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ role, type, level, count: questionCount }) });
            if (!res.ok) throw new Error();
            const { questions: q } = await res.json();
            setQuestions(q); setCurrentIdx(0); setQnaHistory([]); setStep("interview");
        } catch { toast.error("Could not generate questions. Please try again."); }
        finally { setIsLoading(false); }
    }

    async function submitAnswer() {
        if (!answer.trim()) { toast.error("Please type your answer before submitting."); return; }
        setIsLoading(true);
        try {
            const res = await fetch("/api/practice/evaluate", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ question: questions[currentIdx], answer: answer.trim(), role, level }) });
            if (!res.ok) throw new Error();
            const { feedback, score } = await res.json();
            const updated = [...qnaHistory, { question: questions[currentIdx], userAnswer: answer.trim(), aiFeedback: feedback, score }];
            setQnaHistory(updated); setAnswer("");
            if (currentIdx + 1 >= questions.length) setStep("results");
            else setCurrentIdx(i => i + 1);
        } catch { toast.error("Could not evaluate answer. Please try again."); }
        finally { setIsLoading(false); }
    }

    function skipQuestion() {
        const updated = [...qnaHistory, { question: questions[currentIdx], userAnswer:"(Skipped)", aiFeedback:"Question was skipped.", score:0 }];
        setQnaHistory(updated); setAnswer("");
        if (currentIdx + 1 >= questions.length) setStep("results");
        else setCurrentIdx(i => i + 1);
    }

    function restart() { setStep("setup"); setQuestions([]); setQnaHistory([]); setCurrentIdx(0); setAnswer(""); }

    const avgScore = qnaHistory.length > 0 ? Math.round(qnaHistory.reduce((s,q) => s+q.score,0)/qnaHistory.length) : 0;
    const scoreColor = avgScore>=75?"text-green-400":avgScore>=50?"text-yellow-400":"text-red-400";

    if (step === "setup") return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 space-y-5">
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Target Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-black/60 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Interview Type</label>
                    <div className="flex gap-2">
                        {TYPES.map(t => (
                            <button key={t} onClick={() => setType(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${type===t?"bg-blue-600 border-blue-600 text-white":"border-white/20 text-gray-400 hover:border-blue-500/50"}`}>{t}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Experience Level</label>
                    <div className="flex gap-2">
                        {LEVELS.map(l => (
                            <button key={l} onClick={() => setLevel(l)} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${level===l?"bg-teal-600/30 border-teal-400 text-teal-300":"border-white/20 text-gray-400 hover:border-teal-400/50"}`}>{l}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Questions: <span className="text-blue-400 font-bold">{questionCount}</span></label>
                    <input type="range" min={3} max={10} value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))} className="w-full accent-blue-500" />
                    <div className="flex justify-between text-xs text-gray-600 mt-1"><span>3 (Quick)</span><span>10 (Full)</span></div>
                </div>
                <button onClick={startInterview} disabled={isLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Generating...</> : <>🚀 Start Practice Session</>}
                </button>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-gray-400">
                <p className="font-medium text-gray-300 mb-1">💡 How it works</p>
                <p>AI generates tailored questions for your role and level. Type your answer, then get instant feedback and a score. No microphone needed!</p>
            </div>
        </div>
    );

    if (step === "interview") {
        const progress = (currentIdx/questions.length)*100;
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                        <div className="h-1.5 bg-blue-500 rounded-full transition-all duration-500" style={{ width:`${progress}%` }}/>
                    </div>
                    <span className="text-gray-400 text-sm whitespace-nowrap">{currentIdx+1} / {questions.length}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {[role,type,level].map(b => <span key={b} className="px-3 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30 capitalize">{b}</span>)}
                </div>
                <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-5">
                        <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 font-bold text-sm flex-shrink-0">{currentIdx+1}</div>
                        <p className="text-white text-base leading-relaxed font-medium">{questions[currentIdx]}</p>
                    </div>
                    <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer here... Be as detailed and clear as possible." rows={6}
                        className="w-full bg-black/60 border border-white/20 text-gray-200 placeholder-gray-600 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors" disabled={isLoading}/>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600 text-xs">{answer.length} characters</span>
                        <span className="text-gray-600 text-xs">Aim for 100+ characters for a complete answer</span>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button onClick={skipQuestion} disabled={isLoading} className="px-4 py-2 border border-white/20 text-gray-400 hover:text-gray-200 rounded-lg text-sm transition-colors disabled:opacity-40">Skip</button>
                        <button onClick={submitAnswer} disabled={isLoading||!answer.trim()} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Evaluating...</>:<>Submit Answer →</>}
                        </button>
                    </div>
                </div>
                {qnaHistory.length > 0 && (
                    <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                        <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Previous Answers</p>
                        {qnaHistory.map((q,i) => (
                            <div key={i} className="flex items-center gap-2 py-1">
                                <span className={`text-xs font-semibold ${q.score>=75?"text-green-400":q.score>=50?"text-yellow-400":"text-red-400"}`}>{q.score}%</span>
                                <span className="text-gray-500 text-xs truncate">Q{i+1}: {q.question.slice(0,60)}...</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 text-center">
                <p className="text-gray-400 text-sm mb-2">Practice Session Complete</p>
                <p className={`text-5xl font-bold ${scoreColor}`}>{avgScore}%</p>
                <p className="text-gray-300 mt-2 text-sm">{role} · {type} · {level}</p>
                <p className="text-gray-500 text-xs mt-1">{qnaHistory.filter(q=>q.score>=75).length} of {qnaHistory.length} questions scored 75%+</p>
                <button onClick={restart} className="mt-5 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm">🔄 Start New Session</button>
            </div>
            <div className="space-y-3">
                <h3 className="text-white font-semibold">Detailed Review</h3>
                {qnaHistory.map((item, idx) => (
                    <div key={idx} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                        <button onClick={() => setExpandedIdx(expandedIdx===idx?null:idx)} className="w-full flex items-center justify-between p-4 text-left">
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold ${item.score>=75?"text-green-400":item.score>=50?"text-yellow-400":"text-red-400"}`}>{item.score}%</span>
                                <span className="text-gray-300 text-sm">Q{idx+1}: {item.question.slice(0,65)}{item.question.length>65?"...":""}</span>
                            </div>
                            <span className="text-gray-500 text-xs ml-2">{expandedIdx===idx?"▲":"▼"}</span>
                        </button>
                        {expandedIdx===idx && (
                            <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-4">
                                <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Full Question</p><p className="text-gray-300 text-sm">{item.question}</p></div>
                                <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Your Answer</p><p className="text-gray-400 text-sm bg-black/40 rounded-lg p-3">{item.userAnswer}</p></div>
                                <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">AI Feedback</p><p className="text-teal-300 text-sm bg-teal-900/20 border border-teal-500/20 rounded-lg p-3 leading-relaxed">{item.aiFeedback}</p></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
