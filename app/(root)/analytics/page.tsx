import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getFeedbackByInterviewId } from "@/lib/actions/general.action";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default async function AnalyticsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/sign-in");  // try-catch ke bahar rakha

    let interviewsWithFeedback: any[] = [];

    try {
        const result = await getInterviewsByUserId(user.id);
        const interviews = result?.data ?? [];

        interviewsWithFeedback = await Promise.all(
            interviews.map(async (interview) => {
                try {
                    const feedbackResult = await getFeedbackByInterviewId({
                        interviewId: interview.id,
                        userId: user.id,
                    });
                    return {
                        ...interview,
                        feedback: feedbackResult?.data ?? null,
                    };
                } catch {
                    return { ...interview, feedback: null };
                }
            })
        );
    } catch (error) {
        console.error("Analytics fetch error:", error);
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">📊 Your Analytics</h1>
            <p className="text-gray-400 mb-8">
                Track your progress and identify areas for improvement.
            </p>
            <AnalyticsDashboard interviews={interviewsWithFeedback} />
        </div>
    );
}