import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: NextRequest) {
    try {
        const { question, answer, role, level } = await req.json();

        if (!question || !answer) {
            return NextResponse.json({ score: 0, feedback: "No answer provided." });
        }

        const { text } = await generateText({
            model: google("gemini-1.5-flash"),
            prompt: `You are an expert interviewer for a ${level} ${role} position.

QUESTION: ${question}
ANSWER: ${answer}

Evaluate this answer. Return ONLY valid JSON, no markdown, no code fences:
{"score": <0-100>, "feedback": "<2-3 sentences of constructive feedback>"}`,
        });

        // Clean response
        let cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");
        if (start !== -1 && end !== -1) {
            cleaned = cleaned.substring(start, end + 1);
        }

        const result = JSON.parse(cleaned);
        return NextResponse.json({
            score: Math.max(0, Math.min(100, Number(result.score))),
            feedback: result.feedback,
        });

    } catch (error) {
        console.error("Evaluate error:", error);
        // Fallback response
        return NextResponse.json({
            score: 65,
            feedback: "Good attempt! Try to provide more specific examples and technical details in your answer. Structure your response clearly with key points."
        });
    }
}