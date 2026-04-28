"use client";
import { useEffect, useRef } from "react";

export type TranscriptRole = "assistant" | "user";
export interface TranscriptMessage { id: string; role: TranscriptRole; text: string; timestamp: Date; }
interface Props { messages: TranscriptMessage[]; isVisible: boolean; onToggle: () => void; }

export default function TranscriptDisplay({ messages, isVisible, onToggle }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current && isVisible) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isVisible]);

    return (
        <div className="w-full">
            <button onClick={onToggle} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-blue-500/50 rounded-lg px-3 py-2 transition-colors w-full">
                <span>💬</span><span>Live Transcript</span>
                <span className="ml-auto text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full">{messages.length} messages</span>
                <span className="text-xs">{isVisible?"▲":"▼"}</span>
            </button>
            {isVisible && (
                <div className="mt-2 bg-black/60 border border-white/10 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/10 flex justify-between items-center">
                        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Conversation Transcript</span>
                    </div>
                    <div ref={scrollRef} className="overflow-y-auto max-h-64 p-4 space-y-3">
                        {messages.length === 0 ? (
                            <p className="text-gray-600 text-sm text-center py-6">Transcript will appear here once the interview starts...</p>
                        ) : messages.map(msg => (
                            <div key={msg.id} className={`flex gap-3 ${msg.role==="user"?"flex-row-reverse":"flex-row"}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${msg.role==="assistant"?"bg-blue-600/30 text-blue-300":"bg-teal-600/20 text-teal-300"}`}>
                                    {msg.role==="assistant"?"🤖":"👤"}
                                </div>
                                <div className={`max-w-[80%] rounded-xl px-3 py-2 ${msg.role==="assistant"?"bg-white/5 text-gray-200":"bg-blue-600/10 text-gray-200"}`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    <p className="text-gray-600 text-xs mt-1 text-right">{msg.timestamp.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
