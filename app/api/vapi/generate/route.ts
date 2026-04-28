import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";  // ✅ add this
import { getRandomInterviewCover } from '@/lib/utils';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // ✅ Input validation (remove userId from required fields)
        const { type, role, level, techstack, amount } = body || {};
        if (!type || !role || !level || !techstack || !amount) {
            return Response.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // ✅ Get logged in user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return Response.json(
                { success: false, error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // ✅ Generate interview questions
        const { text: questionsText } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions, without any additional text.
Return like: ["Question 1", "Question 2", "Question 3"]`,
        });

        // ✅ Parse questions safely
        let questions: string[] = [];
        try {
            questions = JSON.parse(questionsText);
            if (!Array.isArray(questions)) throw new Error();
        } catch {
            return Response.json(
                { success: false, error: 'Invalid question format from AI' },
                { status: 500 }
            );
        }

        // ✅ Create interview object
        const interview = {
            role,
            type,
            level,
            techstack: techstack.split(',').map((s: string) => s.trim()),
            questions,
            userId: currentUser.id,   // 🔥 Force attach user ID
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        await db.collection('interviews').add(interview);

        return Response.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('❌ Interview generation error:', error);
        return Response.json(
            { success: false, error: (error as Error).message || 'Unknown error' },
            { status: 500 }
        );
    }
}
