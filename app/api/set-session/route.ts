import { NextResponse } from 'next/server';
import { auth } from '@/firebase/admin';

export async function POST(req: Request) {
    const { idToken } = await req.json();

    if (!idToken) {
        return NextResponse.json({ success: false, message: "Missing token" }, { status: 400 });
    }

    try {
        const sessionCookie = await auth.createSessionCookie(idToken, {
            expiresIn: 7 * 24 * 60 * 60 * 1000, // 1 week
        });

        const response = NextResponse.json({ success: true });

        response.cookies.set("session", sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
        });

        return response;
    } catch (err: any) {
        console.error("❌ Session error", err.message);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
