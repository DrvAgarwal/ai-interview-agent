import React from "react";
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import ResumeSection from "@/components/ResumeSection";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";

const Page = async () => {
    const user = await getCurrentUser();

    const [userInterviews, latestInterviews] = await Promise.all([
        user ? getInterviewsByUserId(user.id) : Promise.resolve({ data: [] }),
        user ? getLatestInterviews({ userId: user.id }) : Promise.resolve({ data: [] }),
    ]);

    const myInterviews = userInterviews?.data ?? [];
    const upcomingInterviews = latestInterviews?.data ?? [];

    return (
        <>
            {/* Hero */}
            <section className="relative mb-8 w-full px-6 pt-8">
                <div className="rounded-2xl p-10 bg-black/60 backdrop-blur-lg border border-white/10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="flex flex-col gap-6 max-w-xl text-white">
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            Ace Your Next Interview with{" "}
                            <span className="text-blue-400">AI Power</span>
                        </h1>
                        <p className="text-lg text-slate-200">
                            Practice real-world interview questions with a smart AI agent designed to sharpen your skills.
                        </p>
                        <Link
                            href="/interview/generate"
                            className="w-full flex justify-center bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white text-sm px-6 py-3 rounded-lg shadow-md transition"
                        >
                            Start Interview
                        </Link>
                    </div>
                    <div className="max-w-sm w-full flex justify-center">
                        <Image src="/robot.png" alt="AI Interview Assistant" width={360} height={360} className="object-contain rounded-xl shadow-lg" />
                    </div>
                </div>
            </section>

            {/* Resume Upload */}
            <ResumeSection />

            {/* My Interviews */}
            <section className="flex flex-col gap-6 mt-8 px-6">
                <h2 className="text-white text-3xl font-semibold">My Interviews</h2>
                <div className="flex flex-col gap-4 rounded-2xl p-6 bg-black/60 backdrop-blur-lg border border-white/10 shadow-xl">
                    {myInterviews.length > 0 ? (
                        myInterviews.map((interview: any) => (
                            <InterviewCard
                                key={interview.id}
                                id={interview.id}
                                userId={interview.userId}
                                role={interview.role ?? "Unknown Role"}
                                type={interview.type ?? "General"}
                                techstack={interview.techstack ?? []}
                                level={interview.level ?? "Beginner"}
                                questions={interview.questions ?? []}
                                finalized={interview.finalized ?? false}
                                createdAt={interview.createdAt ?? new Date().toISOString()}
                                feedback={interview.feedback}
                            />
                        ))
                    ) : (
                        <p className="text-slate-300">You have not taken any interview yet. Start one now!</p>
                    )}
                </div>
            </section>

            {/* Latest Interviews */}
            <section className="flex flex-col gap-6 mt-8 px-6 pb-10">
                <h2 className="text-white text-3xl font-semibold">Latest Interviews</h2>
                <div className="flex flex-col gap-4 rounded-2xl p-6 bg-black/60 backdrop-blur-lg border border-white/10 shadow-xl">
                    {upcomingInterviews.length > 0 ? (
                        upcomingInterviews.map((interview: any) => (
                            <InterviewCard
                                key={interview.id}
                                id={interview.id}
                                userId={interview.userId}
                                role={interview.role ?? "Unknown Role"}
                                type={interview.type ?? "General"}
                                techstack={interview.techstack ?? []}
                                level={interview.level ?? "Beginner"}
                                questions={interview.questions ?? []}
                                finalized={interview.finalized ?? false}
                                createdAt={interview.createdAt ?? new Date().toISOString()}
                                feedback={interview.feedback}
                            />
                        ))
                    ) : (
                        <p className="text-slate-300">No interviews available yet.</p>
                    )}
                </div>
            </section>
        </>
    );
};

export default Page;