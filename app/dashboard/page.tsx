"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";

// Define the shape of our database information
type InterviewRecord = {
  id: string;
  created_at: string;
  job_role: string;
  experience_level: string;
  tech_stack: string;
  overall_score: number;
};

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // When the page loads, fetch the data
  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .order("created_at", { ascending: false }); // Newest first

      if (error) throw error;
      if (data) setInterviews(data);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1115] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow Effects for Premium Feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ff5722] rounded-full blur-[200px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#ff5722] rounded-full blur-[150px] opacity-5 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 bg-[#161920]/50 backdrop-blur-md border border-gray-800/50 p-6 md:p-8 rounded-3xl">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              My <span className="text-[#ff5722]">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-lg">Track your mock interview history and monitor your progress over time.</p>
          </div>
          {/* Fix: Changed to inline-flex, rounded-full, and w-full md:w-auto to prevent stretching while maintaining a pill shape */}
          <Link
            href="/interview"
            className="inline-flex items-center justify-center bg-[#ff5722] hover:bg-[#e64a19] text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-[#ff5722]/20 w-full md:w-auto"
          >
            Start New Interview
          </Link>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-[#ff5722] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : interviews.length === 0 ? (
          
          /* Empty State */
          <div className="bg-gradient-to-b from-[#1e222b] to-[#161920] border border-gray-800 rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-xl">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-gray-400">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-100 mb-3">No interviews completed</h3>
            <p className="text-gray-400 mb-8 text-lg">Take your first AI mock interview to generate your performance analytics.</p>
            <Link
              href="/interview"
              className="inline-flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-bold transition-all"
            >
              Begin First Session
            </Link>
          </div>
        ) : (
          
          /* Data Grid with Premium Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interviews.map((interview, index) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1e222b] to-[#161920] border border-gray-800 rounded-3xl p-8 hover:border-[#ff5722]/50 hover:shadow-[0_0_40px_rgba(255,87,34,0.1)] transition-all duration-300 group flex flex-col"
              >
                {/* Subtle top gradient line mimicking glassmorphism lighting */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gray-700 group-hover:via-[#ff5722] to-transparent transition-colors duration-500" />

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-100 mb-1">{interview.job_role}</h3>
                    <span className="inline-block bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full font-medium">
                      {interview.experience_level}
                    </span>
                  </div>
                  
                  {/* Dynamic Score Badge */}
                  <div className={`px-4 py-2 rounded-2xl border flex flex-col items-center justify-center ${
                    interview.overall_score >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : 
                    interview.overall_score >= 60 ? 'bg-amber-500/10 border-amber-500/30' : 
                    'bg-rose-500/10 border-rose-500/30'
                  }`}>
                    <span className={`text-2xl font-black ${
                      interview.overall_score >= 80 ? 'text-emerald-400' : 
                      interview.overall_score >= 60 ? 'text-amber-400' : 
                      'text-rose-400'
                    }`}>
                      {interview.overall_score}%
                    </span>
                  </div>
                </div>

                <div className="mb-8 flex-grow">
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Tech Stack Tested</span>
                  <p className="text-sm text-gray-300 bg-[#0f1115] p-3 rounded-xl border border-gray-800">
                    {interview.tech_stack}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-gray-800 pt-5 mt-auto">
                  <div className="text-sm font-medium text-gray-500">
                    {new Date(interview.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}