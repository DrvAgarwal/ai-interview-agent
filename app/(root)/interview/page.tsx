import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

const InterviewGeneratePage = async () => {
    const user = await getCurrentUser();

    return (
        <div className="flex flex-col items-center px-6 py-10">
            <h1 className="text-3xl font-bold text-white mb-2">Generate Interview</h1>
            <p className="text-gray-400 mb-8">Start your AI-powered voice interview session</p>
            <Agent
                userName={user?.name ?? "Guest"}
                userId={user?.id ?? ""}
                type="generate"
            />
        </div>
    );
};

export default InterviewGeneratePage;