"use client";

import { useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import InterviewTimer from "@/components/InterviewTimer";
import TranscriptDisplay, { TranscriptMessage } from "@/components/TranscriptDisplay";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface AgentProps {
    userName: string;
    userId: string;
    profileImage?: string;
    type: "generate" | "interview";
    interviewId?: string;
    feedbackId?: string;
    questions?: string[];
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

const Agent = ({
                   userName,
                   userId,
                   profileImage,
                   type,
                   interviewId,
                   feedbackId,
                   questions,
               }: AgentProps) => {
    const router = useRouter();

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [showTranscript, setShowTranscript] = useState(false);

    // ---------------- VAPI EVENTS ----------------

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);

        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
        };

        const onMessage = (message: any) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage: SavedMessage = {
                    role: message.role as "user" | "system" | "assistant",
                    content: message.transcript,
                };
                setMessages((prev) => [...prev, newMessage]);

                // Also push to live transcript display
                const role = message.role === "assistant" ? "assistant" : "user";
                setTranscript(prev => [...prev, {
                    id: `${Date.now()}-${prev.length}`,
                    role: role as "assistant" | "user",
                    text: message.transcript,
                    timestamp: new Date(),
                }]);
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("error", (e) => console.log("Error:", e));

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("message", onMessage);
        };
    }, []);

    // ---------------- GENERATE FEEDBACK ----------------

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        if (!interviewId || !userId) return;

        console.log("Generating feedback...");

        const { success, feedbackId: id } = await createFeedback({
            interviewId,
            userId,
            transcript: messages,
            feedbackId,
        });

        if (success && id) {
            router.push(`/interview/${interviewId}/feedback`);
        } else {
            console.log("Error saving feedback");
            router.push("/");
        }
    };

    // ---------------- AFTER CALL FINISH ----------------

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            if (type === "generate") {
                router.push("/");
            } else if (messages.length > 0) {
                handleGenerateFeedback(messages);
            }
        }
    }, [callStatus, messages]);

    // ---------------- START CALL ----------------

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        if (type === "generate") {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                },
            });
        } else {
            let formattedQuestions = "";

            if (questions && questions.length > 0) {
                formattedQuestions = questions.map((q) => `- ${q}`).join("\n");
            }

            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions,
                },
            });
        }
    };

    // ---------------- END CALL ----------------

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    const latestMessage = messages[messages.length - 1]?.content;

    const isCallInactiveOrFinished =
        callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    // ---------------- UI ----------------

    return (
        <div className="flex flex-col items-center justify-center px-4 py-8 text-white font-sans">
            <h2 className="text-4xl font-semibold mb-10 text-center">
                AI Interview Builder
            </h2>

            <div className="flex flex-col md:flex-row gap-10 items-center justify-center mb-8">
                {/* AI CARD */}

                <div className="relative w-90 h-90 rounded-2xl border border-white/10 bg-[#1b1e27] shadow-lg flex flex-col items-center justify-center p-4">
                    <div className="relative bg-gradient-to-br from-blue-300 to-blue-800 p-9 rounded-full mb-4">
                        <Image
                            src="/ai-avatar.png"
                            alt="AI"
                            width={70}
                            height={70}
                            className="object-contain"
                        />

                        {isSpeaking && (
                            <span className="animate-speak absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full" />
                        )}
                    </div>

                    <h3 className="text-lg font-semibold text-center">
                        AI Just Interviewed You
                    </h3>
                </div>

                {/* USER CARD */}

                <div className="relative w-90 h-90 rounded-2xl border border-white/10 bg-[#1b1e27] shadow-lg flex flex-col items-center justify-center p-4">
                    <div className="relative w-37 h-37 rounded-full overflow-hidden mb-4 border-4 border-white/20">
                        <Image
                            src={profileImage || "/user-avatar.png"}
                            alt="User Avatar"
                            width={145}
                            height={145}
                            className="object-cover"
                        />
                    </div>

                    <h3 className="text-lg font-semibold">{userName || "You"}</h3>
                </div>
            </div>

            {/* TIMER + TRANSCRIPT — only visible during active call */}
            {callStatus === CallStatus.ACTIVE && (
                <div className="w-full max-w-3xl space-y-3 mb-4">
                    <InterviewTimer durationMinutes={30} onTimeUp={handleDisconnect} />
                    <TranscriptDisplay
                        messages={transcript}
                        isVisible={showTranscript}
                        onToggle={() => setShowTranscript(v => !v)}
                    />
                </div>
            )}

            {/* MESSAGE */}

            {latestMessage && (
                <div className="flex flex-col items-center justify-center gap-5 bg-[#1b1e27] border border-white/10 shadow-lg px-12 py-4 rounded-xl text-lg text-center mb-6 w-[90%] max-w-3xl">
                    {latestMessage}
                </div>
            )}

            {/* BUTTON */}

            <div className="w-full flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button
                        className={`relative font-semibold py-3 px-6 rounded-full transition duration-300 
            border border-green-200/40 bg-green-600/20 shadow-lg hover:bg-green-600/30 ${
                            callStatus === CallStatus.CONNECTING ? "hidden" : ""
                        }`}
                        onClick={handleCall}
                    >
            <span className="relative z-10">
              {isCallInactiveOrFinished ? "Start Interview" : "..."}
            </span>
                    </button>
                ) : (
                    <button
                        className="font-semibold py-2 px-8 rounded-full transition duration-300
            border border-red-200/40 bg-red-600/20 shadow-lg hover:bg-red-600/30"
                        onClick={handleDisconnect}
                    >
                        END
                    </button>
                )}
            </div>
        </div>
    );
};

export default Agent;