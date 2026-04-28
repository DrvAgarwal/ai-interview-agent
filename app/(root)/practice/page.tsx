import PracticeMode from "@/components/PracticeMode";

export default function PracticePage() {
    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">🎯 Practice Mode</h1>
            <p className="text-gray-400 mb-8">
                Answer questions by typing — no microphone needed!
            </p>
            <PracticeMode userId="guest" />
        </div>
    );
}