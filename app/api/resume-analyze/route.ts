import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function extractTextFromPDF(buffer: Buffer): string {
    const content = buffer.toString("latin1");
    let text = "";
    const btEtMatches = content.match(/BT[\s\S]*?ET/g) || [];
    for (const block of btEtMatches) {
        const parentheses = block.match(/\(([^)\\]|\\.)*\)/g) || [];
        for (const p of parentheses) {
            const str = p.slice(1, -1)
                .replace(/\\n/g, " ").replace(/\\r/g, " ")
                .replace(/[^\x20-\x7E]/g, "");
            if (str.trim().length > 0) text += str + " ";
        }
    }
    if (text.trim().length < 100) {
        text = content.replace(/[^\x20-\x7E\n\r]/g, " ").replace(/\s{2,}/g, " ").trim();
    }
    return text.substring(0, 4000);
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File | null;
        if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const resumeText = extractTextFromPDF(buffer);

        console.log("📄 PDF text length:", resumeText.length);

        if (resumeText.trim().length < 30) {
            return NextResponse.json({
                skills: ["PDF not readable"],
                experience: [],
                education: [],
                summary: "Could not read PDF text. Use a text-based PDF."
            });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        console.log("🔑 OpenAI key exists:", !!apiKey);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert resume parser. Extract information accurately and return only valid JSON."
                    },
                    {
                        role: "user",
                        content: `Parse this resume and return ONLY this JSON (no markdown):

RESUME:
${resumeText}

{
  "skills": ["every skill, language, framework, tool mentioned"],
  "experience": ["Job Title at Company (year-year)"],
  "education": ["Degree, Institution (year)"],
  "summary": "2-3 sentence professional summary based on actual resume content"
}`
                    }
                ],
                temperature: 0.1,
                max_tokens: 1000,
            }),
        });

        console.log("🤖 OpenAI status:", response.status);

        if (!response.ok) {
            const err = await response.text();
            console.error("OpenAI error:", err);
            throw new Error(`OpenAI: ${response.status}`);
        }

        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content || "";
        console.log("✅ AI Response:", aiText.substring(0, 200));

        let cleaned = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");
        if (start !== -1 && end !== -1) cleaned = cleaned.substring(start, end + 1);

        const parsed = JSON.parse(cleaned);
        console.log("✅ Skills found:", parsed.skills?.length);
        return NextResponse.json(parsed);

    } catch (error) {
        console.error("❌ Resume error:", error);
        return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
    }
}