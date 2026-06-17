"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* A subtle glowing background effect to make it look premium */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ff5722] rounded-full blur-[150px] opacity-20 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-4xl z-10"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
          Master Your Interview with <br className="hidden md:block" />
          <span className="text-[#ff5722]">MockMate AI</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Practice technical and HR interviews with an advanced AI. Get instant feedback, track your performance, and land your dream job with confidence.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/interview" 
            className="bg-[#ff5722] hover:bg-[#e64a19] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg shadow-[#ff5722]/30 text-lg"
          >
            Start Mock Interview
          </Link>
        </div>
      </motion.div>
    </main>
  );
}