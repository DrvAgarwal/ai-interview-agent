import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ interviews: [] });

        const result = await getInterviewsByUserId(user.id);
        return NextResponse.json({ interviews: result?.data ?? [] });
    } catch {
        return NextResponse.json({ interviews: [] });
    }
}