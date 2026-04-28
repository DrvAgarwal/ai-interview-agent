"use client";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface ResumeData { skills: string[]; experience: string[]; education: string[]; summary: string; }
interface Props { onResumeAnalyzed: (data: ResumeData) => void; }

export default function ResumeUpload({ onResumeAnalyzed }: Props) {
    const [isUploading, setIsUploading] = useState(false);
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File) {
        if (file.type !== "application/pdf") { toast.error("Please upload a PDF file."); return; }
        if (file.size > 5*1024*1024) { toast.error("File must be smaller than 5MB."); return; }
        setFileName(file.name); setIsUploading(true);
        try {
            const formData = new FormData(); formData.append("resume", file);
            const res = await fetch("/api/resume-analyze", { method:"POST", body: formData });
            if (!res.ok) throw new Error();
            const data: ResumeData = await res.json();
            setResumeData(data); onResumeAnalyzed(data);
            toast.success("Resume analyzed! Questions will be personalized.");
        } catch { toast.error("Could not analyze resume. Please try again."); }
        finally { setIsUploading(false); }
    }

    return (
        <div className="w-full">
            <div onClick={() => fileRef.current?.click()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) handleFile(f); }} onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-blue-500/40 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-colors bg-black/30">
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f) handleFile(f); }}/>
                {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
                        <p className="text-gray-400 text-sm">Analyzing your resume with AI...</p>
                    </div>
                ) : resumeData ? (
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">✅</span>
                        <p className="text-green-400 font-medium">{fileName}</p>
                        <p className="text-gray-400 text-xs">Found {resumeData.skills.length} skills · {resumeData.experience.length} roles</p>
                        <button onClick={e => { e.stopPropagation(); setResumeData(null); setFileName(null); }} className="text-xs text-gray-500 hover:text-gray-300 underline mt-1">Remove resume</button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📄</span>
                        <p className="text-white font-medium">Upload your Resume (Optional)</p>
                        <p className="text-gray-400 text-sm">Drag & drop PDF or click to browse</p>
                        <p className="text-gray-500 text-xs">Max 5MB · PDF only</p>
                    </div>
                )}
            </div>
            {resumeData && (
                <div className="mt-3 bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                    <h4 className="text-white font-semibold text-sm">📋 Resume Summary</h4>
                    {resumeData.summary && <p className="text-gray-400 text-xs">{resumeData.summary}</p>}
                    {resumeData.skills.length > 0 && (
                        <div>
                            <p className="text-gray-500 text-xs mb-1.5">Detected Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                                {resumeData.skills.slice(0,12).map(s => <span key={s} className="px-2 py-0.5 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30">{s}</span>)}
                                {resumeData.skills.length > 12 && <span className="text-gray-500 text-xs">+{resumeData.skills.length-12} more</span>}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
