"use server";

import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export type User = {
    id: string;
    name: string;
    email: string;
    createdAt: string;
};

export type Interview = {
    id: string;
    userId: string;
    finalized?: boolean;
    createdAt: string;
    [key: string]: any;
};

export async function signUp(params: { uid: string; name: string; email: string }) {
    const { uid, name, email } = params;
    try {
        const userRef = db.collection("users").doc(uid);
        await userRef.set({ name, email, createdAt: new Date().toISOString() });
        return { success: true };
    } catch (err: any) {
        return { success: false, message: err.message };
    }
}

export async function signIn(params: { email: string; idToken: string }) {
    try {
        await setSessionCookie(params.idToken);
        return { success: true };
    } catch (err: any) {
        return { success: false, message: err.message };
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    cookieStore.set("session", idToken, {
        maxAge: ONE_WEEK,
        httpOnly: false,
        secure: false,
        path: "/",
        sameSite: "lax",
    });

    try {
        const decoded = await auth.verifyIdToken(idToken);
        cookieStore.set("uid", decoded.uid, {
            maxAge: ONE_WEEK,
            httpOnly: false,
            secure: false,
            path: "/",
            sameSite: "lax",
        });
    } catch (e) {
        console.log("uid cookie error:", e);
    }
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();

    const uid = cookieStore.get("uid")?.value;
    if (uid) {
        try {
            const userDoc = await db.collection("users").doc(uid).get();
            if (userDoc.exists) {
                return { ...userDoc.data(), id: userDoc.id } as User;
            }
        } catch (e) {
            console.log("uid lookup error:", e);
        }
    }

    const session = cookieStore.get("session")?.value;
    if (session) {
        try {
            const decoded = await auth.verifyIdToken(session);
            const userDoc = await db.collection("users").doc(decoded.uid).get();
            if (userDoc.exists) {
                return { ...userDoc.data(), id: userDoc.id } as User;
            }
        } catch {}

        try {
            const decoded = await auth.verifySessionCookie(session, true);
            const userDoc = await db.collection("users").doc(decoded.uid).get();
            if (userDoc.exists) {
                return { ...userDoc.data(), id: userDoc.id } as User;
            }
        } catch {}
    }

    return null;
}

export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}

export async function saveInterview(
    interviewData: Omit<Interview, "id" | "createdAt" | "userId" | "finalized">
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return { success: false, message: "Not authenticated." };
        const ref = await db.collection("interviews").add({
            ...interviewData,
            userId: currentUser.id,
            finalized: true,
            createdAt: new Date().toISOString(),
        });
        return { success: true, id: ref.id };
    } catch (error) {
        return { success: false, message: "Failed to save." };
    }
}