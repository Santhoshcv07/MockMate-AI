"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { jsPDF } from "jspdf"; 

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

// Safe parser for arrays
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
  const [hasResume, setHasResume] = useState(false);
  const [alignmentScores, setAlignmentScores] = useState({ match: 0, tech: 0, comm: 0, readiness: 0 });
  
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setSelectedInterview(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const checkUserAndFetchData = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const { data: resumeData } = await supabaseClient
        .from("resumes")
        .select("resume_text")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (resumeData && resumeData.resume_text) setHasResume(true);

      const { data, error } = await supabaseClient
        .from("interviews")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setInterviews(data);
        const validScores = data.map(i => i.overall_score).filter(score => typeof score === 'number' && !isNaN(score));
        const total = data.length;
        const avgScore = validScores.length > 0 ? Math.round(validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length) : 0;
        const bestScore = validScores.length > 0 ? Math.max(...validScores) : 0;
        
        setStats({ total, avgScore, bestScore });

        const techScores = data.map(i => i.technical_score ?? i.overall_score).filter(s => typeof s === 'number');
        const commScores = data.map(i => i.communication_score ?? i.overall_score).filter(s => typeof s === 'number');
        const recentScores = data.slice(0, 3).map(i => i.overall_score); 

        const avgTech = techScores.length > 0 ? Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length) : 0;
        const avgComm = commScores.length > 0 ? Math.round(commScores.reduce((a, b) => a + b, 0) / commScores.length) : 0;
        const readiness = recentScores.length > 0 ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length) : 0;
        const match = Math.round((avgTech + avgComm + readiness) / 3);

        setAlignmentScores({ match, tech: avgTech, comm: avgComm, readiness });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setIsAuthChecking(false);
    }
  };

  const downloadPDF = () => {
    if (!selectedInterview) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Brand Header
    doc.setFillColor(255, 87, 34);
    doc.rect(0, 0, pageWidth, 24, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("MockMate AI Interview Report", 14, 16);

    // Metadata
    yPos = 40;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Role: ${selectedInterview.job_role || "N/A"}`, 14, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    yPos += 8;
    const date = new Date(selectedInterview.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Date: ${date}`, 14, yPos);
    yPos += 6;
    doc.text(`Experience Level: ${selectedInterview.experience_level || "N/A"}`, 14, yPos);
    yPos += 12;

    // Scores
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Overall Score: ${selectedInterview.overall_score ?? 0}%`, 14, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Technical Score: ${selectedInterview.technical_score ?? 0}%`, 14, yPos);
    yPos += 6;
    doc.text(`Communication Score: ${selectedInterview.communication_score ?? 0}%`, 14, yPos);
    yPos += 14;

    const addSection = (title: string, items: string[], color: number[]) => {
      if (yPos > 260) { doc.addPage(); yPos = 20; }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(title, 14, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);

      if (items.length === 0) {
        doc.text("None recorded.", 14, yPos);
        yPos += 10;
      } else {
        items.forEach((item) => {
          const splitText = doc.splitTextToSize(`• ${item}`, pageWidth - 28);
          if (yPos + (splitText.length * 6) > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(splitText, 14, yPos);
          yPos += (splitText.length * 6) + 2;
        });
        yPos += 4;
      }
    };

    addSection("Strengths", parseList(selectedInterview.strengths), [16, 185, 129]);
    addSection("Weaknesses", parseList(selectedInterview.weaknesses), [244, 63, 94]);
    addSection("Suggestions", parseList(selectedInterview.suggestions), [245, 158, 11]);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated securely by MockMate AI", 14, doc.internal.pageSize.getHeight() - 10);

    const fileName = `MockMate_Report_${selectedInterview.job_role.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#0f1115]" />;
  }

  const topWeaknesses = getTopWeaknesses(interviews);
  const maxWeaknessCount = topWeaknesses.length > 0 ? topWeaknesses[0].count : 1;

  const strongestCategory = stats.bestScore >= stats.avgScore ? "Communication" : "Technical";
  const weakestCategory = stats.avgScore < 50 ? "Technical Skills" : "Communication Skills";

  // --- DYNAMIC RADAR CHART DATA GENERATION ---
  const radarData = [
    { subject: "Technical", score: alignmentScores.tech || 0 },
    { subject: "Communication", score: alignmentScores.comm || 0 },
    { subject: "Problem Solving", score: stats.avgScore ? Math.round((stats.avgScore + alignmentScores.tech) / 2) : 0 },
    { subject: "Behavioral", score: stats.avgScore ? Math.round((stats.avgScore + alignmentScores.comm) / 2) : 0 },
    { subject: "Confidence", score: alignmentScores.comm ? Math.min(100, Math.round(alignmentScores.comm * 1.05)) : 0 },
  ];

  return (
    <main className="min-h-screen bg-[#0f1115] text-white pt-24 pb-6 px-6 md:pt-28 md:pb-12 md:px-12 relative overflow-hidden">
      
      {/* AUTHENTICATED NAVBAR */}
      <DashboardNavbar />

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
          <Link href="/interview" className="inline-flex items-center justify-center bg-[#ff5722] hover:bg-[#e64a19] text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-[#ff5722]/20 w-full md:w-auto">
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
            <Link href="/interview" className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full font-bold transition-all">
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

            {/* THREE COLUMN GRID: INSIGHTS | RADAR CHART | RESUME MATCH */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-lg flex flex-col h-full">
                <h2 className="text-2xl font-bold mb-6">Performance <span className="text-[#ff5722]">Insights</span></h2>
                <div className="grid grid-cols-1 gap-4 flex-grow">
                  <div className="bg-black/20 rounded-2xl p-5 border border-white/5 flex flex-col justify-center">
                    <p className="text-gray-400 text-sm mb-1">Strongest Area</p>
                    <h3 className="text-emerald-400 text-xl font-bold">{strongestCategory}</h3>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-5 border border-white/5 flex flex-col justify-center">
                    <p className="text-gray-400 text-sm mb-1">Needs Improvement</p>
                    <h3 className="text-rose-400 text-xl font-bold">{weakestCategory}</h3>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-5 border border-white/5 flex flex-col justify-center">
                    <p className="text-gray-400 text-sm mb-1">Recommendation</p>
                    <h3 className="text-amber-400 text-sm font-medium">Focus on technical interview practice and provide more detailed examples.</h3>
                  </div>
                </div>
              </motion.div>

              {/* NEW RADAR CHART ANALYTICS */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-lg flex flex-col h-full">
                <div className="mb-2">
                  <h2 className="text-2xl font-bold mb-1">Skill <span className="text-[#ff5722]">Radar</span></h2>
                  <p className="text-gray-400 text-xs">Multi-dimensional capability breakdown.</p>
                </div>

                <div className="h-[200px] w-full flex-grow relative z-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#999', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="score" stroke="#ff5722" fill="#ff5722" fillOpacity={0.4} />
                      <Tooltip contentStyle={{ backgroundColor: '#13151a', borderColor: '#ff5722', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-black/20 rounded-xl p-4 border border-white/5 mt-auto relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Readiness Score</span>
                    <span className="text-emerald-400 font-bold text-lg">{alignmentScores.readiness}%</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-2">
                    <span className="text-amber-400 font-semibold">AI Summary: </span> 
                    Strong focus needed in {weakestCategory.toLowerCase()}, while leveraging your {strongestCategory.toLowerCase()} capabilities.
                  </p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-lg flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">Resume <span className="text-[#ff5722]">Match</span></h2>
                  {hasResume && (
                    <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                      <span className={`text-xl font-black ${alignmentScores.match >= 80 ? 'text-emerald-400' : alignmentScores.match >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {alignmentScores.match}%
                      </span>
                    </div>
                  )}
                </div>

                {hasResume ? (
                  <div className="space-y-6 flex-grow flex flex-col justify-center">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className="text-gray-200 font-medium text-sm md:text-base">Technical Alignment</span>
                        <span className="text-xs font-bold text-gray-400">{alignmentScores.tech}%</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-2.5 border border-white/5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${alignmentScores.tech}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className="text-gray-200 font-medium text-sm md:text-base">Communication Alignment</span>
                        <span className="text-xs font-bold text-gray-400">{alignmentScores.comm}%</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-2.5 border border-white/5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${alignmentScores.comm}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.1 }} className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className="text-gray-200 font-medium text-sm md:text-base">Interview Readiness</span>
                        <span className="text-xs font-bold text-gray-400">{alignmentScores.readiness}%</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-2.5 border border-white/5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${alignmentScores.readiness}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="h-full bg-gradient-to-r from-[#e64a19] to-[#ff5722] rounded-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow bg-black/10 border border-white/5 rounded-2xl border-dashed p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-4xl mb-3 opacity-80 animate-pulse">📄</div>
                    <h3 className="text-white font-semibold mb-1">Resume Not Found</h3>
                    <p className="text-sm text-gray-400 mb-5">Sync your resume to unlock your AI Match Score and personalized alignments.</p>
                    <Link href="/resume" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all">Upload Resume</Link>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col h-full">
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <span className="bg-rose-500/20 text-rose-500 p-2 rounded-lg text-lg">🎯</span> Recurring Weaknesses
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Top areas for improvement identified across all your mock interviews.</p>
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  {topWeaknesses.length > 0 ? (
                    <div className="space-y-5">
                      {topWeaknesses.map((weakness, idx) => {
                        const widthPercent = Math.max((weakness.count / maxWeaknessCount) * 100, 5);
                        return (
                          <div key={idx} className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                              <span className="text-gray-200 font-medium text-sm md:text-base truncate pr-4">{weakness.name}</span>
                              <span className="text-xs font-bold text-gray-400 bg-black/30 px-2 py-1 rounded-md border border-white/5 whitespace-nowrap">
                                {weakness.count} {weakness.count === 1 ? "time" : "times"}
                              </span>
                            </div>
                            <div className="w-full bg-black/40 rounded-full h-2 border border-white/5 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${widthPercent}%` }} transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }} className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full" />
                            </div>
                          </div>
                          
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4 bg-black/10 border border-white/5 rounded-2xl border-dashed h-full flex flex-col items-center justify-center">
                      <div className="text-4xl mb-3 opacity-80 animate-pulse">🌟</div>
                      <h3 className="text-white font-semibold mb-1">No Weaknesses Detected</h3>
                      <p className="text-sm text-gray-400 max-w-[250px] mx-auto">Complete more mock interviews to unlock deep analytics on your improvement areas.</p>
                    </div>
                  )}
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="col-span-1 lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Performance <span className="text-[#ff5722]">Trend</span></h2>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="interview" stroke="#999" />
                      <YAxis domain={[0, 100]} stroke="#999" />
                      <Tooltip contentStyle={{ backgroundColor: '#13151a', borderColor: '#ff5722', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
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

      {/* --- MODAL WITH PDF BUTTON --- */}
      <AnimatePresence>
        {isModalOpen && selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setIsModalOpen(false); setSelectedInterview(null); }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#171a20]/95 border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold">{selectedInterview.job_role}</h2>
                  <p className="text-gray-400 mt-2">{selectedInterview.experience_level}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-[#ff5722] border border-white/20 hover:border-[#ff5722] text-white text-sm font-bold rounded-xl transition-all shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                  <button
                    onClick={() => { setIsModalOpen(false); setSelectedInterview(null); }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Overall</p>
                  <h3 className="text-3xl font-bold text-[#ff5722]">{selectedInterview.overall_score ?? 0}%</h3>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Technical</p>
                  <h3 className="text-3xl font-bold text-cyan-400">{selectedInterview.technical_score ?? 0}%</h3>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-gray-400 text-sm">Communication</p>
                  <h3 className="text-3xl font-bold text-emerald-400">{selectedInterview.communication_score ?? 0}%</h3>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mb-8">
                <h3 className="font-bold mb-3 text-lg">Tech Stack</h3>
                <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                  {parseList(selectedInterview.tech_stack).join(", ") || "Not specified"}
                </div>
              </div>

              {/* Strengths */}
              <div className="mb-8">
                <h3 className="font-bold text-emerald-400 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {parseList(selectedInterview.strengths).map((item, i) => <li key={i}>• {item}</li>)}
                  {parseList(selectedInterview.strengths).length === 0 && <li className="text-gray-500">No strengths recorded</li>}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="mb-8">
                <h3 className="font-bold text-rose-400 mb-3">Weaknesses</h3>
                <ul className="space-y-2">
                  {parseList(selectedInterview.weaknesses).map((item, i) => <li key={i}>• {item}</li>)}
                  {parseList(selectedInterview.weaknesses).length === 0 && <li className="text-gray-500">No weaknesses recorded</li>}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="mb-8">
                <h3 className="font-bold text-amber-400 mb-3">Suggestions</h3>
                <ul className="space-y-2">
                  {parseList(selectedInterview.suggestions).map((item, i) => <li key={i}>• {item}</li>)}
                  {parseList(selectedInterview.suggestions).length === 0 && <li className="text-gray-500">No suggestions recorded</li>}
                </ul>
              </div>

              {/* Date */}
              <div className="border-t border-white/10 pt-6">
                <p className="text-gray-400">
                  Interview Date: {new Date(selectedInterview.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}