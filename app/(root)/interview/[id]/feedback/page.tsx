import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getFeedbackByInterviewId, getInterviewById } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import ExportFeedbackButton from "@/components/ExportFeedbackButton";
import ShareResultCard from "@/components/ShareResultCard";

interface PageProps {
    params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { id: interviewId } = await params;
    if (!interviewId) redirect("/");

    const user = await getCurrentUser();
    const { success, data: feedback } = await getFeedbackByInterviewId({
        interviewId,
        userId: user?.id ?? "",
    });
    const interview = await getInterviewById(interviewId);

    if (!success || !feedback) {
        return (
            <div className="text-white text-center mt-20 text-xl">
                Feedback not found
            </div>
        );
    }

    const score = feedback.totalScore;

    return (
        <div className="text-white max-w-5xl mx-auto px-6 py-10">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                <h1 className="text-3xl font-bold">Interview Feedback</h1>
                <div className="flex gap-3 flex-wrap">
                    <ExportFeedbackButton
                        interview={{
                            ...interview,
                            feedback: {
                                totalScore: feedback.totalScore,
                                categoryScores: feedback.categoryScores,
                                strengths: feedback.strengths,
                                areasForImprovement: feedback.areasForImprovement,
                                finalAssessment: feedback.finalAssessment,
                            }
                        }}
                        userName={user?.name ?? "Candidate"}
                    />
                </div>
            </div>

            {/* TOTAL SCORE */}
            <div className="bg-[#1b1e27] p-6 rounded-xl mb-8 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Overall Score</h2>
                <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${score >= 75 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${score}%` }}
                    />
                </div>
                <p className="mt-3 text-2xl font-bold">
                    {score}/100
                    <span className="text-sm font-normal text-gray-400 ml-3">
                        {score >= 85 ? "Excellent 🏆" : score >= 70 ? "Good 🎯" : score >= 50 ? "Average 📈" : "Needs Improvement 💪"}
                    </span>
                </p>
            </div>

            {/* CATEGORY SCORES */}
            <div className="bg-[#1b1e27] p-6 rounded-xl mb-8 border border-white/10">
                <h2 className="text-xl font-semibold mb-5">Report Card</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {feedback.categoryScores.map((item: any, index: number) => (
                        <div key={index} className="bg-[#252836] p-4 rounded-lg border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-semibold">{item.name}</p>
                                <span className={`font-bold ${item.score >= 75 ? "text-green-400" : item.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                                    {item.score}/100
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 rounded-full mb-2">
                                <div
                                    className={`h-2 rounded-full ${item.score >= 75 ? "bg-green-500" : item.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                    style={{ width: `${item.score}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-300">{item.comment}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* STRENGTHS */}
            <div className="bg-[#1b1e27] p-6 rounded-xl mb-8 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">✅ Strengths</h2>
                <ul className="space-y-2">
                    {feedback.strengths.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">→</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* IMPROVEMENTS */}
            <div className="bg-[#1b1e27] p-6 rounded-xl mb-8 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">🎯 Areas for Improvement</h2>
                <ul className="space-y-2">
                    {feedback.areasForImprovement.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">→</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* FINAL ASSESSMENT */}
            <div className="bg-[#1b1e27] p-6 rounded-xl mb-8 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">💡 Final Assessment</h2>
                <p className="text-gray-300 leading-relaxed">{feedback.finalAssessment}</p>
            </div>

            {/* SHARE */}
            <div className="mb-8">
                <ShareResultCard
                    role={interview?.role ?? "Software Engineer"}
                    score={feedback.totalScore}
                    level={interview?.level}
                    interviewType={interview?.type}
                />
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 justify-center mt-6">
                <Link href="/" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition">
                    🏠 Back to Home
                </Link>
                <Link href="/practice" className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition">
                    🎯 Practice More
                </Link>
            </div>

        </div>
    );
};

export default Page;