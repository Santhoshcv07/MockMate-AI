"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

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
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // New Analytics State
  const [stats, setStats] = useState({ total: 0, avgScore: 0, bestScore: 0 });
  
  const router = useRouter();

  useEffect(() => {
    checkUserAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUserAndFetchData = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from("interviews")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setInterviews(data);
        
        // Calculate Analytics
        const total = data.length;
        const avgScore = Math.round(data.reduce((acc, curr) => acc + curr.overall_score, 0) / total);
        const bestScore = Math.max(...data.map(i => i.overall_score));
        
        setStats({ total, avgScore, bestScore });
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
      setIsAuthChecking(false);
    }
  };

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#0f1115]" />;
  }

  return (
    <main className="min-h-screen bg-[#0f1115] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ff5722] rounded-full blur-[200px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#ff5722] rounded-full blur-[150px] opacity-5 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section in White Glassmorphism */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              My <span className="text-[#ff5722]">Dashboard</span>
            </h1>
            <p className="text-gray-300 text-lg">Track your mock interview history and monitor your progress.</p>
          </div>
          <Link
            href="/interview"
            className="inline-flex items-center justify-center bg-[#ff5722] hover:bg-[#e64a19] text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-[#ff5722]/20 w-full md:w-auto"
          >
            Start New Interview
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-[#ff5722] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-2xl">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No interviews completed</h3>
            <p className="text-gray-400 mb-8 text-lg">Take your first AI mock interview to generate your performance analytics.</p>
            <Link
              href="/interview"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full font-bold transition-all"
            >
              Begin First Session
            </Link>
          </div>
        ) : (
          <>
            {/* NEW: Top Analytics KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Interviews</span>
                <span className="text-4xl font-black text-white">{stats.total}</span>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Average Score</span>
                <span className="text-4xl font-black text-[#ff5722]">{stats.avgScore}%</span>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
                <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Best Performance</span>
                <span className="text-4xl font-black text-emerald-400">{stats.bestScore}%</span>
              </motion.div>
            </div>

            {/* Glassmorphism Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {interviews.map((interview, index) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-3xl p-8 hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,87,34,0.15)] transition-all duration-300 group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{interview.job_role}</h3>
                      <span className="inline-block bg-white/10 text-gray-300 border border-white/10 text-xs px-3 py-1 rounded-full font-medium">
                        {interview.experience_level}
                      </span>
                    </div>
                    
                    <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
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
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Tech Stack Tested</span>
                    <p className="text-sm text-gray-200 bg-black/20 p-3 rounded-xl border border-white/5">
                      {interview.tech_stack}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/10 pt-5 mt-auto">
                    <div className="text-sm font-medium text-gray-400">
                      {new Date(interview.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}