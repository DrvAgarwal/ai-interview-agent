"use server";
import { db } from "@/firebase/admin";
import type { LeaderboardEntry } from "@/components/LeaderboardTable";

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
        const snapshot = await db.collection("interviews").get();
        const userMap: Record<string, { totalScore:number; count:number; bestScore:number; roles:string[]; displayName:string }> = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (!data.feedback?.totalScore || !data.userId) return;
            const uid = data.userId as string;
            if (!userMap[uid]) userMap[uid] = { totalScore:0, count:0, bestScore:0, roles:[], displayName: data.userName || "Anonymous" };
            userMap[uid].totalScore += data.feedback.totalScore;
            userMap[uid].count += 1;
            userMap[uid].bestScore = Math.max(userMap[uid].bestScore, data.feedback.totalScore);
            if (data.role) userMap[uid].roles.push(data.role);
        });

        return Object.entries(userMap)
            .filter(([, v]) => v.count >= 1)
            .map(([userId, v]) => {
                const freq: Record<string,number> = {};
                v.roles.forEach(r => (freq[r] = (freq[r]??0)+1));
                const topRole = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "—";
                return { userId, displayName: v.displayName, avatarInitial: v.displayName?.[0]??"U", avgScore: Math.round(v.totalScore/v.count), interviewCount: v.count, bestScore: v.bestScore, topRole };
            })
            .sort((a,b) => b.avgScore-a.avgScore)
            .slice(0, 20);
    } catch (error) {
        console.error("getLeaderboard error:", error);
        return [];
    }
}
