"use client";
import { useState } from "react";
import ResumeUpload from "@/components/ResumeUpload";

interface ResumeData {
    skills: string[];
    experience: string[];
    education: string[];
    summary: string;
}

export default function ResumeSection() {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);

    return (
        <section className="flex flex-col gap-4 mt-8">
            <div className="flex items-center justify-between">
                <h2 className="text-white text-3xl font-semibold">
                    📄 Resume Upload
                </h2>
                <p className="text-slate-400 text-sm">
                    Optional — personalizes your interview questions
                </p>
            </div>
            <div className="rounded-2xl p-6 bg-black/60 backdrop-blur-lg border border-white/10 hover:border-white/20 shadow-xl transition-all">
                <ResumeUpload onResumeAnalyzed={setResumeData} />
                {resumeData && (
                    <p className="mt-3 text-green-400 text-sm text-center">
                        ✅ Resume ready — your next interview will use these skills
                    </p>
                )}
            </div>
        </section>
    );
}