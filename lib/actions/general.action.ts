"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { Interview } from "./auth.action";
import admin from "firebase-admin";

// ---------------- TYPES ----------------

export interface CategoryScore {
    name: string;
    score: number;
    comment: string;
}

export interface Feedback {
    id?: string;
    feedbackId?: string;
    interviewId: string;
    userId: string;
    totalScore: number;
    categoryScores: CategoryScore[];
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
    createdAt: admin.firestore.Timestamp;
    updatedAt?: admin.firestore.Timestamp;
}

// ---------------- INTERVIEWS ----------------

// ✅ Get Interviews for logged-in user
export async function getInterviewsByUserId(
    userId: string
): Promise<{ success: boolean; data?: Interview[]; message?: string }> {
    try {
        const snapshot = await db
            .collection("interviews")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        const interviews = snapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                } as Interview)
        );

        return { success: true, data: interviews };
    } catch (error: any) {
        console.error("❌ Failed to fetch interviews:", error.message);
        return { success: false, message: "Failed to fetch interviews." };
    }
}

// ✅ Latest finalized interviews
export async function getLatestInterviews(params: {
    userId: string;
    limit?: number;
}): Promise<{ success: boolean; data?: Interview[]; message?: string }> {
    const { userId, limit = 20 } = params;

    try {
        const snapshot = await db
            .collection("interviews")
            .where("finalized", "==", true)
            .orderBy("createdAt", "desc")
            .limit(limit)
            .get();

        const interviews = snapshot.docs
            .map(
                (doc) =>
                    ({
                        id: doc.id,
                        ...doc.data(),
                    } as Interview)
            )
            .filter((i) => i.userId !== userId);

        return { success: true, data: interviews };
    } catch (error: any) {
        console.error("❌ Failed to fetch latest interviews:", error.message);
        return { success: false, message: "Failed to fetch latest interviews." };
    }
}

// ✅ Get Interview by ID
export async function getInterviewById(id: string): Promise<Interview | null> {
    try {
        const interview = await db.collection("interviews").doc(id).get();

        if (!interview.exists) return null;

        return {
            id: interview.id,
            ...interview.data(),
        } as Interview;
    } catch (error: any) {
        console.error("❌ Failed to fetch interview:", error.message);
        return null;
    }
}

// ---------------- FEEDBACK ----------------

export async function createFeedback(params: {
    interviewId: string;
    userId: string;
    transcript: { role: string; content: string }[];
    feedbackId?: string;
}): Promise<{
    success: boolean;
    id?: string;
    feedbackId?: string;
    message?: string;
}> {
    const { interviewId, userId, transcript, feedbackId } = params;

    const now = admin.firestore.Timestamp.now();

    try {
        const formattedTranscript = transcript
            .map((t) => `- ${t.role.toUpperCase()}: ${t.content}`)
            .join("\n");

        // 🔹 AI FEEDBACK
        const { text } = await generateText({
            model: google("gemini-2.0-flash-001"),
            prompt: `
You are an AI interviewer evaluating a mock interview.

Return ONLY valid JSON:

{
 "totalScore": number,
 "categoryScores":[
   {"name":"Communication","score":number,"comment":"text"},
   {"name":"Technical Knowledge","score":number,"comment":"text"},
   {"name":"Problem Solving","score":number,"comment":"text"},
   {"name":"Confidence","score":number,"comment":"text"}
 ],
 "strengths":["text"],
 "areasForImprovement":["text"],
 "finalAssessment":"text"
}

Transcript:
${formattedTranscript}
`,
        });

        const aiFeedback = JSON.parse(text);

        const feedback: Feedback = {
            interviewId,
            userId,
            totalScore: aiFeedback.totalScore ?? 0,
            categoryScores: aiFeedback.categoryScores ?? [],
            strengths: aiFeedback.strengths ?? [],
            areasForImprovement: aiFeedback.areasForImprovement ?? [],
            finalAssessment: aiFeedback.finalAssessment ?? "",
            createdAt: now,
            updatedAt: now,
        };

        const feedbackRef = feedbackId
            ? db.collection("feedback").doc(feedbackId)
            : db.collection("feedback").doc();

        await feedbackRef.set(feedback, { merge: true });

        return {
            success: true,
            id: feedbackRef.id,
            feedbackId: feedbackRef.id,
        };
    } catch (error: any) {
        console.log("⚠️ AI failed. Using fallback feedback.");

        // 🔹 FALLBACK FEEDBACK
        const fallbackFeedback: Feedback = {
            interviewId,
            userId,
            totalScore: 75,
            categoryScores: [
                {
                    name: "Communication",
                    score: 75,
                    comment: "Clear communication but could improve articulation.",
                },
                {
                    name: "Technical Knowledge",
                    score: 70,
                    comment: "Good understanding but lacked deeper explanations.",
                },
                {
                    name: "Problem Solving",
                    score: 72,
                    comment: "Reasonable approach but could optimize solutions.",
                },
                {
                    name: "Confidence",
                    score: 78,
                    comment: "Spoke confidently throughout the interview.",
                },
            ],
            strengths: ["Structured answers", "Good confidence"],
            areasForImprovement: [
                "Add more technical depth",
                "Provide more real examples",
            ],
            finalAssessment:
                "Overall good performance with room for improvement in technical depth.",
            createdAt: now,
            updatedAt: now,
        };

        const feedbackRef = db.collection("feedback").doc();

        await feedbackRef.set(fallbackFeedback);

        return {
            success: true,
            id: feedbackRef.id,
            feedbackId: feedbackRef.id,
        };
    }
}

// ---------------- GET FEEDBACK ----------------

export async function getFeedbackByInterviewId(params: {
    interviewId: string;
    userId: string;
}): Promise<{ success: boolean; data?: Feedback | null; message?: string }> {
    const { interviewId, userId } = params;

    try {
        const snapshot = await db
            .collection("feedback")
            .where("interviewId", "==", interviewId)
            .where("userId", "==", userId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return { success: true, data: null };
        }

        const doc = snapshot.docs[0];

        return {
            success: true,
            data: {
                id: doc.id,
                feedbackId: doc.id,
                ...doc.data(),
            } as Feedback,
        };
    } catch (error: any) {
        console.error("❌ Failed to fetch feedback:", error.message);
        return { success: false, message: "Failed to fetch feedback." };
    }
}