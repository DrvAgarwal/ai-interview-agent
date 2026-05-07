"use client";
import { useEffect, useState } from "react";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function AnalyticsPage() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then(r => r.json())
            .then(data => { setInterviews(data.interviews || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ minHeight: "100vh", padding: "40px 24px", maxWidth: "1000px", margin: "0 auto" }}>
            <h1 style={{ color: "white", fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
                📊 Your Analytics
            </h1>
            <p style={{ color: "#9ca3af", marginBottom: "32px" }}>
                Track your progress and identify areas for improvement.
            </p>
            {loading ? (
                <p style={{ color: "white" }}>Loading...</p>
            ) : (
                <AnalyticsDashboard interviews={interviews} />
            )}
        </div>
    );
}