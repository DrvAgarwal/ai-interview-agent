"use client";
import { useState } from "react";
import Agent from "@/components/Agent";
import ResumeUpload from "@/components/ResumeUpload";

export default function InterviewGeneratePage() {
    const [resumeData, setResumeData] = useState<any>(null);

    return (
        <div className="flex flex-col items-center px-6 py-10 max-w-3xl mx-auto w-full">
            <h1 className="text-3xl font-bold text-white mb-2">Generate Interview</h1>
            <p className="text-gray-400 mb-8">Start your AI-powered voice interview session</p>

            {/* Resume Upload */}
            <div className="w-full mb-8">
                <ResumeUpload onResumeAnalyzed={(data) => setResumeData(data)} />
            </div>

            {resumeData && (
                <div className="w-full mb-6 bg-black/40 border border-white/10 rounded-xl p-4">
                    <p className="text-green-400 text-sm font-medium">
                        ✅ Resume analyzed! Interview will be personalized based on your skills:
                        <span className="text-blue-300 ml-2">{resumeData.skills?.slice(0,5).join(", ")}</span>
                    </p>
                </div>
            )}

            {/* Voice Agent */}
            <Agent
                userName="Guest"
                userId=""
                type="generate"
            />
        </div>
    );
}