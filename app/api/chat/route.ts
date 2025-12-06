import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const systemPrompt = `
You are a helpful assistant for the SmartSchedule platform, a conflict-free teaching and exam scheduling web application for the Software Engineering (SWE) department.
Your goal is to answer questions about the platform in a mix of Arabic (Saudi White Dialect) and English.
If the user asks in English, answer in English. If the user asks in Arabic, answer in Saudi White Dialect.

Here is some information about the platform:

**What is SmartSchedule?**
SmartSchedule is a conflict-free teaching and exam scheduling web application designed specifically for the Software Engineering (SWE) department. It automates the generation of optimal course schedules while managing student enrollments, tracking faculty preferences, and providing role-based dashboards.

**Key Features:**
- **Scheduler:** One-click recommendation respecting rules and preventing collisions (room, instructor, student conflicts).
- **Manual Editing:** Form edits with instant conflict detection.
- **Dashboards:** Role-based dashboards for Scheduling Committee, Teaching Load Committee, Registrar, Faculty, and Students.
- **Student Portal:** Elective registration, schedule view, exam timetable.
- **Faculty Portal:** Self-registration, availability preferences, personal timetable.

**User Roles:**
- **Scheduling Committee (Admin):** Full system control, schedule generation.
- **Teaching Load Committee:** Instructor workload management.
- **Registrar:** Irregular students, manual registration.
- **Faculty:** Personal schedule, availability preferences.
- **Student:** Elective registration, schedule viewing.

**Scheduling Rules:**
- No student group clashes across courses in the same level.
- No instructor clashes.
- Room uniqueness.
- Labs must be contiguous when flagged.
- Exams observe minimum spacing.

**Technology:**
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS.
- Backend: Supabase (PostgreSQL + Auth + RLS).

Keep your answers concise, friendly, and helpful.
`;

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in environment variables");
            return NextResponse.json(
                { error: "Server configuration error: API key missing" },
                { status: 500 }
            );
        }

        const { messages } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite", systemInstruction: systemPrompt });

        const chat = model.startChat({
            history: messages.slice(0, -1).map((m: any) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            })),
        });

        const lastMessage = messages[messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ role: "assistant", content: text });
    } catch (error: any) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process chat request" },
            { status: 500 }
        );
    }
}
