"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  
  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  
  // Simulated progress state
  const [progressStep, setProgressStep] = useState(0);
  const progressMessages = [
    "Uploading resume...",
    "Analyzing profile...",
    "Extracting skills...",
    "Generating interview context..."
  ];

  useEffect(() => {
    if (uploading) {
      const interval = setInterval(() => {
        setProgressStep((prev) => Math.min(prev + 1, progressMessages.length - 1));
      }, 700);
      return () => clearInterval(interval);
    } else {
      setProgressStep(0);
    }
  }, [uploading]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError("");
    setResult(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Invalid file type. Please upload a valid PDF document.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

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
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/resume", {
        method: "POST",
        headers,
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const htmlText = await res.text(); 
        console.error("Server crashed. Returned HTML:", htmlText);
        throw new Error("The backend API crashed. Please check your network or server logs.");
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
    <main className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col items-center justify-center relative overflow-hidden py-20 pt-32">
      
      {/* AUTHENTICATED NAVBAR */}
      <DashboardNavbar />

      {/* BACKGROUND GLOWS & GRIDS (Landing Page Match) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <img src="/images/ai-bg.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF6B35] rounded-full blur-[200px] opacity-[0.05] pointer-events-none z-0" />

      <div className="w-full max-w-4xl px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          <Link href="/dashboard" className="text-sm font-bold uppercase tracking-widest text-[#666666] hover:text-[#FF6B35] transition-colors flex items-center gap-2 w-fit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-xl shadow-black/5 p-8 md:p-10"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-[#111111]">
              Sync <span className="text-[#FF6B35]">Resume</span> Context
            </h1>
            <p className="text-[#666666] text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Upload your resume to give the AI your exact career context. MockMate will extract your skills and experience to ask highly tailored interview questions.
            </p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-8 max-w-2xl mx-auto">
            
            {/* DYNAMIC UPLOAD ZONE */}
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-3xl min-h-[280px] flex flex-col items-center justify-center p-8 text-center shadow-sm"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-[#10B981] rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-black text-[#111111] mb-4 tracking-tight">Resume Successfully Synced</h3>
                  <div className="flex flex-col gap-3 items-center text-sm font-bold text-[#666666]">
                    <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm"><span className="text-[#10B981] text-lg">✓</span> Resume Match Ready</span>
                    <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm"><span className="text-[#10B981] text-lg">✓</span> Interview Context Generated</span>
                  </div>
                </motion.div>
              ) : uploading ? (
                <motion.div 
                  key="uploading"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-orange-50/60 border border-orange-100 rounded-3xl min-h-[280px] flex flex-col items-center justify-center p-10 text-center shadow-inner"
                >
                  <div className="relative w-24 h-24 mb-8">
                    <svg className="w-full h-full animate-spin text-[#FF6B35]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                      <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">🤖</span>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-sm mx-auto space-y-3">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[#FF6B35] font-bold text-base">{progressMessages[progressStep]}</span>
                      <span className="text-[#666666] text-sm font-black">{Math.round(((progressStep + 1) / progressMessages.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-orange-200/50 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${((progressStep + 1) / progressMessages.length) * 100}%` }} 
                        className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] rounded-full"
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  whileHover={{ y: -4 }}
                  className={`relative border-2 border-dashed rounded-3xl min-h-[280px] flex flex-col items-center justify-center p-8 text-center transition-all duration-300 group cursor-pointer ${
                    isDragging ? 'border-[#FF6B35] bg-orange-50/80 shadow-md' : 'border-orange-200 bg-orange-50/40 hover:bg-orange-50/60 hover:shadow-lg hover:shadow-orange-500/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    disabled={uploading}
                  />
                  <div className="space-y-4 pointer-events-none flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm text-[#FF6B35] mb-2 group-hover:scale-110 transition-transform duration-300"
                    >
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    </motion.div>
                    
                    <div>
                      <h3 className="text-[#111111] font-black text-xl mb-1">
                        {file ? file.name : "Drag & Drop Resume"}
                      </h3>
                      <p className="text-[#666666] font-medium text-sm">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready to sync` : "or click to upload (PDF only)"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-100 text-[#EF4444] p-5 rounded-2xl text-sm font-bold text-center shadow-sm">
                <span className="mr-2">⚠️</span> {error}
              </motion.div>
            )}

            {!result && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!file || uploading}
                className="w-full bg-[#FF6B35] hover:bg-[#ff7a4d] text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-[#FF6B35]/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Synthesizing..." : "Sync Resume"}
              </motion.button>
            )}
            
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Link href="/interview" className="w-full bg-[#111111] hover:bg-gray-800 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-3">
                  Continue to Interview
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
                <div className="text-center mt-6">
                  <button 
                    type="button" 
                    onClick={() => { setFile(null); setResult(null); }}
                    className="text-sm font-bold text-[#666666] hover:text-[#FF6B35] transition-colors underline underline-offset-4 decoration-2 decoration-gray-200 hover:decoration-[#FF6B35]"
                  >
                    Upload a different resume
                  </button>
                </div>
              </motion.div>
            )}

          </form>
        </motion.div>
      </div>
    </main>
  );
}