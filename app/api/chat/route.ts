import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. Keep your exact expected input format
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 2. Grab the Auth Token sent from the frontend
    const authHeader = req.headers.get("Authorization");

    // 3. Initialize Supabase securely
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // Only attach headers if the auth token exists
      authHeader ? { global: { headers: { Authorization: authHeader } } } : {}
    );

    // 4. Verify the user (Don't block if not logged in, just skip the resume context)
    const { data: { user } } = await supabase.auth.getUser();

    // 5. Fetch the Resume Context from the database
    let resumeContext = "";
    if (user) {
      const { data: resumeData, error } = await supabase
        .from("resumes")
        .select("resume_text")
        .eq("user_id", user.id)
        .single();

      if (resumeData && resumeData.resume_text) {
        resumeContext = resumeData.resume_text;
      }
    }

    // 6. Construct the dynamic System Prompt
  const systemMessage = {
  role: "system" as const,
  content: `You are MockMate AI, an expert technical recruiter and senior software engineer conducting a realistic mock interview.

${resumeContext
  ? `
CRITICAL RULES:

You MUST use the candidate resume below.

DO NOT ask generic interview questions.

Every question must be based on:
- Projects mentioned in the resume
- Technologies mentioned in the resume
- Skills mentioned in the resume
- Experience mentioned in the resume

BAD EXAMPLES:
❌ What is React?
❌ What is Java?
❌ Explain SQL joins.

GOOD EXAMPLES:
✅ Your resume mentions Java and MySQL. Explain how you designed the database schema in one of your projects.
✅ I see you worked on Full Stack Development. Describe a challenging bug you encountered and how you solved it.
✅ Tell me about the most technically difficult feature you implemented in your project.

CRITICAL:

Before asking any question, first identify a project, skill, or technology from the resume.

Every question MUST explicitly mention at least one item from the resume.

Examples:

"Your resume mentions a Smart Expense Tracker project. Explain the database design and architecture."

"I see you worked with Java and MySQL. Describe a challenging bug you encountered."

"Your resume mentions Full Stack Development. Explain the most difficult feature you implemented."

Never ask a question that does not directly reference something from the resume.

If the resume contains programming languages, frameworks, or databases, ask questions specifically about those technologies.

Candidate Resume:

${resumeContext}
`
  : `
Ask challenging software engineering, full stack, and behavioral interview questions.
`
}

Guidelines:
- Ask ONE question at a time.
- Maintain a professional recruiter tone.
- Focus on practical experience over theory.
- Prioritize project-based questions over textbook questions.
- Make the interview feel realistic and personalized.
`
};

    // 7. Call the Groq API (Standard Request/Response, NO streaming)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        systemMessage,
        { role: "user" as const, content: prompt } // Your frontend's exact prompt
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

    // 8. Return your exact expected output format
    return NextResponse.json({
      text: responseText
    });

  } catch (error: any) {
    console.error("Chat API Error Details:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process chat request" },
      { status: 500 }
    );
  }
}