import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    const uid = request.cookies.get("uid")?.value;
    const { pathname } = request.nextUrl;

    const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
    const isLoggedIn = session || uid;

    // If logged in and on auth page → go home
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Allow everything else
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};