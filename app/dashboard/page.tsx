"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface InterviewRecord {
  id: string;
  created_at: string;
  job_role: string;
  experience_level: string;
  tech_stack?: string | string[];
  overall_score: number;
  technical_score?: number;
  communication_score?: number;
  strengths?: string[] | string;
  weaknesses?: string[] | string;
  suggestions?: string[] | string;
}

// --- TOP WEAKNESS AGGREGATION ---
interface TopWeakness {
  name: string;
  count: number;
}

function getTopWeaknesses(interviews: any[]): TopWeakness[] {
  if (!interviews || interviews.length === 0) return [];
  const counts: Record<string, number> = {};

  interviews.forEach((interview) => {
    let weaknessesList: string[] = [];
    if (Array.isArray(interview.weaknesses)) {
      weaknessesList = interview.weaknesses;
    } else if (typeof interview.weaknesses === "string") {
      try {
        weaknessesList = JSON.parse(interview.weaknesses);
        if (!Array.isArray(weaknessesList)) throw new Error("Not an array");
      } catch {
        weaknessesList = interview.weaknesses.split(",").map((w: string) => w.trim());
      }
    }

    weaknessesList.forEach((w) => {
      if (!w || typeof w !== "string") return;
      const normalized = w.trim().toLowerCase();
      if (normalized.length === 0) return;
      const displayForm = normalized.charAt(0).toUpperCase() + normalized.slice(1);
      counts[displayForm] = (counts[displayForm] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Safe parser for arrays in the modal to prevent rendering crashes
const parseList = (data: string | string[] | undefined): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return data.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, bestScore: 0 });
  
  // --- MODAL STATE ---
  const [selectedInterview, setSelectedInterview] = useState<InterviewRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const chartData = interviews
    .slice()
    .reverse()
    .map((interview, index) => ({
      interview: `#${index + 1}`,
      score: interview.overall_score,
    }));

  const router = useRouter();

  useEffect(() => {
    checkUserAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- ESCAPE KEY CLOSE LISTENER ---
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setSelectedInterview(null);
      }
    };
  
    window.addEventListener("keydown", handleEscape);
  
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
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
        
        const validScores = data
          .map(i => i.overall_score)
          .filter(score => typeof score === 'number' && !isNaN(score));

        const total = data.length;
        const avgScore = validScores.length > 0 
          ? Math.round(validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length) 
          : 0;
        const bestScore = validScores.length > 0 
          ? Math.max(...validScores) 
          : 0;
        
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

  const topWeaknesses = getTopWeaknesses(interviews);
  const maxWeaknessCount = topWeaknesses.length > 0 ? topWeaknesses[0].count : 1;

  // --- PERFORMANCE INSIGHT LOGIC ---
  const strongestCategory =
    stats.bestScore >= stats.avgScore
      ? "Communication"
      : "Technical";

  const weakestCategory =
    stats.avgScore < 50
      ? "Technical Skills"
      : "Communication Skills";

  return (
    <main className="min-h-screen bg-[#0f1115] text-white p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ff5722] rounded-full blur-[200px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#ff5722] rounded-full blur-[150px] opacity-5 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
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

            {/* PERFORMANCE INSIGHTS CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-10 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-6">
                Performance <span className="text-[#ff5722]">Insights</span>
              </h2>

              <div className="grid md:grid-cols-3 gap-6">

                <div className="bg-black/20 rounded-2xl p-5">
                  <p className="text-gray-400 text-sm mb-2">
                    Strongest Area
                  </p>

                  <h3 className="text-emerald-400 text-xl font-bold">
                    {strongestCategory}
                  </h3>
                </div>

                <div className="bg-black/20 rounded-2xl p-5">
                  <p className="text-gray-400 text-sm mb-2">
                    Needs Improvement
                  </p>

                  <h3 className="text-rose-400 text-xl font-bold">
                    {weakestCategory}
                  </h3>
                </div>

                <div className="bg-black/20 rounded-2xl p-5">
                  <p className="text-gray-400 text-sm mb-2">
                    Recommendation
                  </p>

                  <h3 className="text-amber-400 text-sm font-medium">
                    Focus on technical interview practice and provide more detailed examples.
                  </h3>
                </div>

              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {/* Weakness Analytics Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col h-full">
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <span className="bg-rose-500/20 text-rose-500 p-2 rounded-lg text-lg">🎯</span> 
                    Recurring Weaknesses
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Top areas for improvement identified across all your mock interviews.
                  </p>
                </div>

                <div className="flex-grow flex flex-col justify-center">
                  {topWeaknesses.length > 0 ? (
                    <div className="space-y-5">
                      {topWeaknesses.map((weakness, idx) => {
                        const widthPercent = Math.max((weakness.count / maxWeaknessCount) * 100, 5);
                        return (
                          <div key={idx} className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                              <span className="text-gray-200 font-medium text-sm md:text-base truncate pr-4">
                                {weakness.name}
                              </span>
                              <span className="text-xs font-bold text-gray-400 bg-black/30 px-2 py-1 rounded-md border border-white/5 whitespace-nowrap">
                                {weakness.count} {weakness.count === 1 ? "time" : "times"}
                              </span>
                            </div>
                            <div className="w-full bg-black/40 rounded-full h-2 border border-white/5 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${widthPercent}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4 bg-black/10 border border-white/5 rounded-2xl border-dashed h-full flex flex-col items-center justify-center">
                      <div className="text-4xl mb-3 opacity-80 animate-pulse">🌟</div>
                      <h3 className="text-white font-semibold mb-1">No Weaknesses Detected</h3>
                      <p className="text-sm text-gray-400 max-w-[250px] mx-auto">
                        Complete more mock interviews to unlock deep analytics on your improvement areas.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="col-span-1 lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-lg"
              >
                <h2 className="text-2xl font-bold mb-6">
                  Performance <span className="text-[#ff5722]">Trend</span>
                </h2>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="interview" stroke="#999" />
                      <YAxis domain={[0, 100]} stroke="#999" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#13151a', borderColor: '#ff5722', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#ff5722" strokeWidth={4} dot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* INTERVIEW CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((interview, index) => (
                <motion.div
                  key={interview.id}
                  onClick={() => {
                    setSelectedInterview(interview);
                    setIsModalOpen(true);
                  }}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-3xl p-8 hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,87,34,0.15)] transition-all duration-300 group flex flex-col cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{interview.job_role}</h3>
                      <span className="inline-block bg-white/10 text-gray-300 border border-white/10 text-xs px-3 py-1 rounded-full font-medium">
                        {interview.experience_level}
                      </span>
                    </div>
                    
                    <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center group-hover:bg-[#ff5722]/10 transition-colors">
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
                      {parseList(interview.tech_stack).join(", ")}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/10 pt-5 mt-auto">
                    <div className="text-sm font-medium text-gray-400">
                      {new Date(interview.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                    <span className="text-[#ff5722] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      View Report <span className="text-lg">→</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- INTERVIEW DETAIL MODAL --- */}
      <AnimatePresence>
        {isModalOpen && selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsModalOpen(false);
              setSelectedInterview(null);
            }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#171a20]/95 border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold">
                    {selectedInterview.job_role}
                  </h2>
                  <p className="text-gray-400 mt-2">
                    {selectedInterview.experience_level}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedInterview(null);
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Overall</p>
                  <h3 className="text-3xl font-bold text-[#ff5722]">
                    {selectedInterview.overall_score ?? 0}%
                  </h3>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Technical</p>
                  <h3 className="text-3xl font-bold text-cyan-400">
                    {selectedInterview.technical_score ?? 0}%
                  </h3>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Communication</p>
                  <h3 className="text-3xl font-bold text-emerald-400">
                    {selectedInterview.communication_score ?? 0}%
                  </h3>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mb-8">
                <h3 className="font-bold mb-3 text-lg">
                  Tech Stack
                </h3>
                <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                  {parseList(selectedInterview.tech_stack).join(", ") || "Not specified"}
                </div>
              </div>

              {/* Strengths */}
              <div className="mb-8">
                <h3 className="font-bold text-emerald-400 mb-3">
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {parseList(selectedInterview.strengths).map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                  {parseList(selectedInterview.strengths).length === 0 && (
                    <li className="text-gray-500">
                      No strengths recorded
                    </li>
                  )}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="mb-8">
                <h3 className="font-bold text-rose-400 mb-3">
                  Weaknesses
                </h3>
                <ul className="space-y-2">
                  {parseList(selectedInterview.weaknesses).map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                  {parseList(selectedInterview.weaknesses).length === 0 && (
                    <li className="text-gray-500">
                      No weaknesses recorded
                    </li>
                  )}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="mb-8">
                <h3 className="font-bold text-amber-400 mb-3">
                  Suggestions
                </h3>
                <ul className="space-y-2">
                  {parseList(selectedInterview.suggestions).map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                  {parseList(selectedInterview.suggestions).length === 0 && (
                    <li className="text-gray-500">
                      No suggestions recorded
                    </li>
                  )}
                </ul>
              </div>

              {/* Date */}
              <div className="border-t border-white/10 pt-6">
                <p className="text-gray-400">
                  Interview Date:{" "}
                  {new Date(
                    selectedInterview.created_at
                  ).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}