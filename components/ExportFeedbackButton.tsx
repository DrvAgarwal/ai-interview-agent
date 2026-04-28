"use client";
import { useState } from "react";
import { toast } from "sonner";

interface Props { interview: any; userName?: string; }

export default function ExportFeedbackButton({ interview, userName = "Candidate" }: Props) {
    const [isGenerating, setIsGenerating] = useState(false);

    async function handleExport() {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/export-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ interview, userName }),
            });
            if (!res.ok) throw new Error();

            const html = await res.text();

            // Naye tab mein kholo aur print dialog se PDF save karo
            const printWindow = window.open("", "_blank");
            if (!printWindow) throw new Error("Popup blocked");

            printWindow.document.write(html);
            printWindow.document.close();

            // Page load hone ke baad print dialog open karo
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            };

            toast.success("Report opened! Print → Save as PDF");
        } catch {
            toast.error("Could not generate report. Try again.");
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/50 text-blue-300 hover:bg-blue-600/10 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isGenerating ? (
                <>
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <span>📄</span>
                    Export as PDF
                </>
            )}
        </button>
    );
}