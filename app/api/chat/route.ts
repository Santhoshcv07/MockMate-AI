import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize the Google Gen AI SDK
// We explicitly pass the API key from our secure .env.local file
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Read the message (prompt) sent from our frontend interface
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "A prompt is required." },
        { status: 400 }
      );
    }

    // Send the prompt to Gemini's ultra-fast flash model
    const response = await ai.models.generateContent({
   model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Send the AI's response back to our frontend
    return NextResponse.json({ text: response.text });
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response. Please check your API key or try again." },
      { status: 500 }
    );
  }
}