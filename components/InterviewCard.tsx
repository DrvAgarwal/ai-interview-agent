import React from "react";
import Image from "next/image";
import dayjs from "dayjs";
import Link from "next/link";
import { getRandomInterviewCover } from "@/lib/utils";
import DisplayTechIcons from "@/components/DisplayTechIcons";

type InterviewCardProps = {
    id: string;
    userId: string;
    role: string;
    type: string;
    techstack: string[];
    level: string;
    questions: string[];
    finalized: boolean;
    createdAt: string;
    feedback?: {
        totalscore: number;
        finalAssessment?: string;
    };
};

const InterviewCard = ({
                           id,
                           role,
                           type,
                           techstack,
                           createdAt,
                           feedback,
                       }: InterviewCardProps) => {
    // normalize type
    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

    // date formatting (use createdAt only, feedback does not have createdAt)
    const formattedDate = dayjs(createdAt || Date.now()).format("MMM DD, YYYY");

    return (
        <div className="relative mb-6 w-full animate-fadeSlide">
            {/* glowing animated gradient */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-blue-500 via-purple-500 to-teal-400 blur-sm"></div>

            {/* glassy card */}
            <div className="relative group rounded-2xl p-[1px] backdrop-blur-md bg-black/40 transition-all duration-300 border border-white/15 hover:border-white/30 shadow-lg">
                <div className="rounded-[inherit] p-8 w-full text-white">
                    <div className="flex flex-row items-start gap-6">
                        {/* Avatar */}
                        <Image
                            src={getRandomInterviewCover()}
                            alt="cover"
                            width={80}
                            height={80}
                            className="rounded-full object-cover border border-white/30"
                        />

                        {/* Details */}
                        <div className="flex flex-1 flex-col">
                            <h3 className="text-xl font-semibold mb-1 break-words">
                                {role} Interview ({normalizedType})
                            </h3>

                            <div className="flex flex-wrap gap-5 text-sm text-slate-200">
                                <div className="flex items-center gap-2">
                                    <Image src="/calendar.svg" alt="calendar" width={20} height={20} />
                                    <span>{formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Image src="/star.svg" alt="rating" width={20} height={20} />
                                    <span>{feedback?.totalscore ?? "---"}/100</span>
                                </div>
                            </div>

                            <p className="text-sm text-slate-300 mt-3 break-words">
                                {feedback?.finalAssessment ??
                                    "You have not taken the interview yet. Take it now to improve your skills."}
                            </p>

                            <div className="flex flex-row items-center justify-end mt-6 space-x-6">
                                {/* Icons */}
                                <div className="flex flex-row gap-4">
                                    <DisplayTechIcons techStack={techstack} />
                                </div>

                                {/* CTA */}
                                <Link
                                    href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}
                                    className="px-6 py-2 text-sm rounded-lg transition
                             bg-black/50 border border-white/20 text-white
                             backdrop-blur-lg hover:bg-black/60 hover:border-white/40"
                                >
                                    {feedback ? "Check Feedback" : "View Interview"}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewCard;
