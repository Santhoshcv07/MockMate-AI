import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    // Initialize Groq
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Ask Llama 3.3 on Groq's super-fast hardware
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", // CHANGED: Now using the fully supported, modern model
      temperature: 0.7,
    });

    // Extract the text and send it back to the frontend
    const aiResponseText = chatCompletion.choices[0]?.message?.content || "";
    return NextResponse.json({ text: aiResponseText });
    
  } catch (error: any) {
    console.error("Groq API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect to Groq." },
      { status: 500 }
    );
  }
}