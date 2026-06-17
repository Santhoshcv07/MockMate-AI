import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 1. Grab the Auth token passed from the frontend
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // 2. Initialize Supabase WITH the user's token so Row Level Security (RLS) works
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // 3. Verify the user securely
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid user token." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);

    try {
      await import("pdf-parse/worker");
    } catch (e) {
      // Safely ignore polyfill
    }

    const pdfModule = await import("pdf-parse");
    const PDFParse = pdfModule.PDFParse;

    if (!PDFParse) {
      throw new Error("Could not locate the PDFParse class.");
    }

    // --- TYPING FIX ---
    // Cast to 'any' to bypass the incomplete LoadParameters type definition
    const options: any = { 
      data: uint8Array,
      disableWorker: true,
      isEvalSupported: false 
    };

    const parser = new PDFParse(options);
    const pdfData = await parser.getText();
    
    // --- TYPING FIX ---
    // Removed pdfData.content since TS knows the exact type is 'text'
    const resumeText = pdfData.text || "";

    // 4. Save to Database using UPSERT
    // We add .select().single() to force Supabase to return the saved row. 
    // If RLS silently blocks it, this will explicitly throw an error instead of pretending it worked.
    const { data: savedData, error: dbError } = await supabase
      .from("resumes")
      .upsert(
        { 
          user_id: user.id, 
          resume_text: resumeText,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" } 
      )
      .select()
      .single();

    if (dbError || !savedData) {
      console.error("Supabase Insertion Error:", dbError);
      throw new Error(dbError?.message || "Database blocked the save. Check RLS policies.");
    }

    return NextResponse.json({
      success: true,
      textLength: resumeText.length,
      preview: resumeText.slice(0, 300) || "Parsed successfully, but no readable text was found.",
    });

  } catch (error: any) {
    console.error("Resume API Error Details:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process resume" },
      { status: 500 }
    );
  }
}