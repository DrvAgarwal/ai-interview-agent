import LeaderboardTable from "@/components/LeaderboardTable";

export default function LeaderboardPage() {
    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">🏆 Leaderboard</h1>
            <p className="text-gray-400 mb-8">Top performers ranked by score!</p>
            <LeaderboardTable entries={[]} currentUserId="" />
        </div>
    );
}