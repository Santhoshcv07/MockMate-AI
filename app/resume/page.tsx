"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import DashboardNavbar from "@/components/layout/DashboardNavbar";

interface UploadResponse {
  success: boolean;
  textLength: number;
  preview: string;
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UploadResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setResult(null);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (selectedFile.type !== "application/pdf") {
        setError("Invalid file type. Please upload a valid PDF document.");
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Initialize Supabase client to get the current user's session token
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session } } = await supabase.auth.getSession();

      // 2. Prepare headers safely for TypeScript
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      // 3. Send file AND secure token to backend
      const res = await fetch("/api/resume", {
        method: "POST",
        headers,
        body: formData,
      });

      // --- CRASH DEFENSE ---
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const htmlText = await res.text(); 
        console.error("Server crashed. Returned HTML:", htmlText);
        throw new Error("The backend API crashed. Please check your VS Code Terminal for the exact red error.");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An error occurred while parsing your file.");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to parse document. Ensure the PDF isn't corrupted.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1115] text-white p-6 pt-28 md:p-12 md:pt-32 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* AUTHENTICATED NAVBAR */}
      <DashboardNavbar />

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ff5722] rounded-full blur-[200px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#ff5722] rounded-full blur-[150px] opacity-5 pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        <div className="mb-6">
          <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#ff5722] transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Sync <span className="text-[#ff5722]">Resume Context</span>
            </h1>
            <p className="text-gray-300 text-sm">
              Upload your resume as a PDF. MockMate AI will tailor your practice questions directly to your career profile.
            </p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div className="relative border-2 border-dashed border-white/10 hover:border-[#ff5722]/50 rounded-2xl p-8 text-center transition-colors bg-black/10 group cursor-pointer">
              <input 
                type="file" 
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                disabled={uploading}
              />
              <div className="space-y-2 pointer-events-none">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">📄</div>
                <div className="text-white font-semibold text-base">
                  {file ? file.name : "Choose a PDF resume file"}
                </div>
                <p className="text-gray-400 text-xs">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Only standardized PDF documents supported"}
                </p>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm font-medium text-center">
                ⚠️ {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full bg-[#ff5722] hover:bg-[#e64a19] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#ff5722]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Parsing Resume Insights...
                </>
              ) : (
                "Upload & Synthesize"
              )}
            </button>
          </form>

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-8 pt-8 border-t border-white/10 space-y-4"
            >
              <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl text-emerald-400 text-sm font-semibold">
                <span>✅ Analysis Sequence Complete</span>
                <span className="text-xs opacity-80">{result.textLength} Characters Found</span>
              </div>
              
              <div className="space-y-1.5">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Extracted Context Preview</span>
                <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-xs font-mono text-gray-300 leading-relaxed max-h-40 overflow-y-auto">
                  {result.preview}...
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  );
}