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
    return <div className="min-h-screen bg-[#FAFAFA]" />;
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
    <main className="min-h-screen bg-[#FAFAFA] text-[#111111] pt-24 pb-6 px-6 md:pt-28 md:pb-12 md:px-12 relative overflow-hidden font-sans">
      
      {/* AUTHENTICATED NAVBAR */}
      <DashboardNavbar />

      {/* --- BACKGROUND GLOWS, GRIDS, & IMAGE LAYER --- */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <img src="/images/ai-bg.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FF6B35] rounded-full blur-[150px] opacity-[0.05] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white/80 backdrop-blur-xl border border-white/60 p-6 md:p-8 rounded-[24px] shadow-lg shadow-black/5">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-[#111111]">
              My <span className="text-[#FF6B35]">Dashboard</span>
            </h1>
            <p className="text-[#666666] text-lg font-medium">Track your mock interview history and monitor your progress.</p>
          </div>
          <Link href="/interview" className="inline-flex items-center justify-center bg-[#FF6B35] hover:bg-[#e64a19] text-white px-8 py-4 rounded-full font-bold transition-all shadow-[0_8px_20px_rgba(255,107,53,0.3)] hover:-translate-y-0.5 w-full md:w-auto">
            Start New Interview
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-gray-100 border-t-[#FF6B35] rounded-full mb-6 shadow-sm"
            />
            <motion.h3
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xl font-bold text-[#111111] tracking-tight"
            >
              Executive Processing
            </motion.h3>
            <p className="text-[#666666] text-sm mt-2 font-medium">Retrieving your AI analytics...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-16 text-center max-w-2xl mx-auto shadow-lg shadow-black/5 hover:-translate-y-1 transition-all duration-300">
            <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-[#111111] mb-3">No interviews completed</h3>
            <p className="text-[#666666] mb-8 text-lg font-medium">Take your first AI mock interview to generate your performance analytics.</p>
            <Link href="/interview" className="inline-flex items-center justify-center bg-[#FF6B35] hover:bg-[#e65a25] text-white px-8 py-4 rounded-full font-bold transition-all shadow-[0_8px_20px_rgba(255,107,53,0.3)] hover:-translate-y-0.5">
              Begin First Session
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform duration-300">
                <span className="text-[#666666] text-sm font-bold uppercase tracking-wider mb-2">Total Interviews</span>
                <span className="text-4xl font-black text-[#111111]">{stats.total}</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform duration-300">
                <span className="text-[#666666] text-sm font-bold uppercase tracking-wider mb-2">Average Score</span>
                <span className="text-4xl font-black text-[#FF6B35]">{stats.avgScore}%</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform duration-300">
                <span className="text-[#666666] text-sm font-bold uppercase tracking-wider mb-2">Best Performance</span>
                <span className="text-4xl font-black text-[#10B981]">{stats.bestScore}%</span>
              </motion.div>
            </div>

            {/* THREE COLUMN GRID: INSIGHTS | RADAR CHART | RESUME MATCH */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-6 shadow-lg shadow-black/5 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                <h2 className="text-2xl font-bold mb-6 text-[#111111]">Performance <span className="text-[#FF6B35]">Insights</span></h2>
                <div className="grid grid-cols-1 gap-4 flex-grow">
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-center">
                    <p className="text-[#666666] text-sm mb-1 font-semibold">Strongest Area</p>
                    <h3 className="text-[#10B981] text-xl font-bold">{strongestCategory}</h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-center">
                    <p className="text-[#666666] text-sm mb-1 font-semibold">Needs Improvement</p>
                    <h3 className="text-[#EF4444] text-xl font-bold">{weakestCategory}</h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col justify-center">
                    <p className="text-[#666666] text-sm mb-1 font-semibold">Recommendation</p>
                    <h3 className="text-[#FF6B35] text-sm font-bold leading-relaxed">Focus on technical interview practice and provide more detailed examples.</h3>
                  </div>
                </div>
              </motion.div>

              {/* RADAR CHART ANALYTICS */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-6 shadow-lg shadow-black/5 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-2">
                  <h2 className="text-2xl font-bold mb-1 text-[#111111]">Skill <span className="text-[#FF6B35]">Radar</span></h2>
                  <p className="text-[#666666] text-xs font-semibold">Multi-dimensional capability breakdown.</p>
                </div>

                <div className="h-[200px] w-full flex-grow relative z-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#666666', fontSize: 10, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="score" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.2} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '12px', fontSize: '12px', color: '#111111', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} itemStyle={{ color: '#FF6B35', fontWeight: 'bold' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-auto relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#666666] text-xs font-bold uppercase tracking-widest">Readiness Score</span>
                    <span className="text-[#10B981] font-black text-lg">{alignmentScores.readiness}%</span>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed border-t border-gray-200 pt-2 font-medium">
                    <span className="text-[#FF6B35] font-bold">AI Summary: </span> 
                    Strong focus needed in {weakestCategory.toLowerCase()}, while leveraging your {strongestCategory.toLowerCase()} capabilities.
                  </p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-6 shadow-lg shadow-black/5 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-[#111111]">Resume <span className="text-[#FF6B35]">Match</span></h2>
                  {hasResume && (
                    <div className="px-3 py-1 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center">
                      <span className={`text-xl font-black ${alignmentScores.match >= 80 ? 'text-[#10B981]' : alignmentScores.match >= 60 ? 'text-[#FF6B35]' : 'text-[#EF4444]'}`}>
                        {alignmentScores.match}%
                      </span>
                    </div>
                  )}
                </div>

                {hasResume ? (
                  <div className="space-y-6 flex-grow flex flex-col justify-center">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[#111111] font-bold text-sm md:text-base">Technical Alignment</span>
                        <span className="text-xs font-black text-[#666666]">{alignmentScores.tech}%</span>
                      </div>
                      <div className="w-full bg-orange-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${alignmentScores.tech}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] rounded-full" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[#111111] font-bold text-sm md:text-base">Communication Alignment</span>
                        <span className="text-xs font-black text-[#666666]">{alignmentScores.comm}%</span>
                      </div>
                      <div className="w-full bg-orange-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${alignmentScores.comm}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.1 }} className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] rounded-full" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[#111111] font-bold text-sm md:text-base">Interview Readiness</span>
                        <span className="text-xs font-black text-[#666666]">{alignmentScores.readiness}%</span>
                      </div>
                      <div className="w-full bg-orange-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${alignmentScores.readiness}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="h-full bg-gradient-to-r from-[#e64a19] to-[#ff5722] rounded-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow bg-gray-50 border border-gray-200 rounded-2xl border-dashed p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-4xl mb-3 opacity-80 animate-pulse">📄</div>
                    <h3 className="text-[#111111] font-bold mb-1">Resume Not Found</h3>
                    <p className="text-sm text-[#666666] font-medium mb-5">Sync your resume to unlock your AI Match Score and personalized alignments.</p>
                    <Link href="/resume" className="bg-white hover:bg-gray-50 border border-gray-200 text-[#111111] px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm">Upload Resume</Link>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-6 md:p-8 shadow-lg shadow-black/5 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-6">
                  <h2 className="text-xl font-extrabold text-[#111111] tracking-tight flex items-center gap-3">
                    <span className="bg-orange-100 text-[#FF6B35] p-2 rounded-lg text-lg">🎯</span> Recurring Weaknesses
                  </h2>
                  <p className="text-[#666666] text-sm mt-1 font-medium">Top areas for improvement identified across all your mock interviews.</p>
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  {topWeaknesses.length > 0 ? (
                    <div className="space-y-5">
                      {topWeaknesses.map((weakness, idx) => {
                        const widthPercent = Math.max((weakness.count / maxWeaknessCount) * 100, 5);
                        return (
                          <div key={idx} className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                              <span className="text-[#111111] font-bold text-sm md:text-base truncate pr-4">{weakness.name}</span>
                              <span className="text-xs font-bold text-[#666666] bg-gray-100 px-2 py-1 rounded-md border border-gray-200 whitespace-nowrap">
                                {weakness.count} {weakness.count === 1 ? "time" : "times"}
                              </span>
                            </div>
                            <div className="w-full bg-orange-100 rounded-full h-2 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${widthPercent}%` }} transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }} className="h-full bg-[#FF6B35] rounded-full" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4 bg-gray-50 border border-gray-200 rounded-2xl border-dashed h-full flex flex-col items-center justify-center">
                      <div className="text-4xl mb-3 opacity-80 animate-pulse">🌟</div>
                      <h3 className="text-[#111111] font-bold mb-1">No Weaknesses Detected</h3>
                      <p className="text-sm text-[#666666] font-medium max-w-[250px] mx-auto">Complete more mock interviews to unlock deep analytics on your improvement areas.</p>
                    </div>
                  )}
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="col-span-1 lg:col-span-2 bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-6 md:p-8 shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform duration-300">
                <h2 className="text-2xl font-bold mb-6 text-[#111111]">Performance <span className="text-[#FF6B35]">Trend</span></h2>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="interview" stroke="#9ca3af" tick={{fontSize: 12, fontWeight: 500}} />
                      <YAxis domain={[0, 100]} stroke="#9ca3af" tick={{fontSize: 12, fontWeight: 500}} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', color: '#111111', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} itemStyle={{ color: '#FF6B35' }} />
                      <Line type="monotone" dataKey="score" stroke="#FF6B35" strokeWidth={4} dot={{ r: 6, fill: '#fff', stroke: '#FF6B35', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#FF6B35', stroke: '#fff', strokeWidth: 2 }} />
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
                  className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/60 rounded-[24px] p-8 shadow-lg shadow-black/5 hover:scale-[1.02] hover:shadow-xl hover:border-orange-200 transition-all duration-300 group flex flex-col cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-[#111111] mb-1 tracking-tight">{interview.job_role}</h3>
                      <span className="inline-block bg-gray-50 text-[#666666] border border-gray-200 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                        {interview.experience_level}
                      </span>
                    </div>
                    
                    <div className="px-4 py-2 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center group-hover:bg-orange-50 transition-colors">
                      <span className={`text-2xl font-black ${
                        interview.overall_score >= 80 ? 'text-[#10B981]' : 
                        interview.overall_score >= 60 ? 'text-[#FF6B35]' : 
                        'text-[#EF4444]'
                      }`}>
                        {interview.overall_score}%
                      </span>
                    </div>
                  </div>

                  <div className="mb-8 flex-grow">
                    <span className="text-[10px] text-[#666666] uppercase tracking-widest font-black mb-2 block">Tech Stack Tested</span>
                    <p className="text-sm text-[#111111] font-semibold bg-gray-50 p-3 rounded-xl border border-gray-100">
                      {parseList(interview.tech_stack).join(", ") || "Not specified"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-100 pt-5 mt-auto">
                    <div className="text-sm font-bold text-[#666666]">
                      {new Date(interview.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                    <span className="text-[#FF6B35] text-sm font-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      View Report <span className="text-lg">→</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* --- MODAL WITH PDF BUTTON --- */}
      <AnimatePresence>
        {isModalOpen && selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setIsModalOpen(false); setSelectedInterview(null); }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-[24px] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 md:p-10 shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#111111] tracking-tight">{selectedInterview.job_role}</h2>
                  <p className="text-[#666666] font-bold mt-2 uppercase tracking-widest text-sm">{selectedInterview.experience_level}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-[#FF6B35] border border-gray-200 hover:border-[#FF6B35] text-[#111111] hover:text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                  <button
                    onClick={() => { setIsModalOpen(false); setSelectedInterview(null); }}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#111111] hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 bg-gray-50 border border-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
                  <p className="text-[#666666] text-xs font-bold uppercase tracking-widest mb-1">Overall</p>
                  <h3 className="text-3xl md:text-4xl font-black text-[#FF6B35]">{selectedInterview.overall_score ?? 0}%</h3>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
                  <p className="text-[#666666] text-xs font-bold uppercase tracking-widest mb-1">Technical</p>
                  <h3 className="text-3xl md:text-4xl font-black text-cyan-500">{selectedInterview.technical_score ?? 0}%</h3>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center shadow-sm">
                  <p className="text-[#666666] text-xs font-bold uppercase tracking-widest mb-1">Communication</p>
                  <h3 className="text-3xl md:text-4xl font-black text-[#10B981]">{selectedInterview.communication_score ?? 0}%</h3>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mb-8">
                <h3 className="font-extrabold text-[#111111] mb-3 text-lg border-b border-gray-100 pb-2">Tech Stack</h3>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 font-semibold text-[#111111]">
                  {parseList(selectedInterview.tech_stack).join(", ") || "Not specified"}
                </div>
              </div>

              {/* Strengths */}
              <div className="mb-8">
                <h3 className="font-extrabold text-[#10B981] mb-3 text-lg flex items-center gap-2 border-b border-gray-100 pb-2">
                  <span className="bg-emerald-100 text-[#10B981] w-6 h-6 rounded-full flex items-center justify-center text-sm">✓</span> Strengths
                </h3>
                <ul className="space-y-3">
                  {parseList(selectedInterview.strengths).map((item, i) => <li key={i} className="flex items-start gap-2 text-[#111111] font-medium"><span className="text-[#10B981] mt-0.5">•</span> {item}</li>)}
                  {parseList(selectedInterview.strengths).length === 0 && <li className="text-[#666666] italic">No strengths recorded</li>}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="mb-8">
                <h3 className="font-extrabold text-[#EF4444] mb-3 text-lg flex items-center gap-2 border-b border-gray-100 pb-2">
                  <span className="bg-red-100 text-[#EF4444] w-6 h-6 rounded-full flex items-center justify-center text-sm">✕</span> Weaknesses
                </h3>
                <ul className="space-y-3">
                  {parseList(selectedInterview.weaknesses).map((item, i) => <li key={i} className="flex items-start gap-2 text-[#111111] font-medium"><span className="text-[#EF4444] mt-0.5">•</span> {item}</li>)}
                  {parseList(selectedInterview.weaknesses).length === 0 && <li className="text-[#666666] italic">No weaknesses recorded</li>}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="mb-8">
                <h3 className="font-extrabold text-[#FF6B35] mb-3 text-lg flex items-center gap-2 border-b border-gray-100 pb-2">
                  <span className="bg-orange-100 text-[#FF6B35] w-6 h-6 rounded-full flex items-center justify-center text-sm">💡</span> Suggestions
                </h3>
                <ul className="space-y-3">
                  {parseList(selectedInterview.suggestions).map((item, i) => <li key={i} className="flex items-start gap-2 text-[#111111] font-medium"><span className="text-[#FF6B35] mt-0.5">•</span> {item}</li>)}
                  {parseList(selectedInterview.suggestions).length === 0 && <li className="text-[#666666] italic">No suggestions recorded</li>}
                </ul>
              </div>

              {/* Date */}
              <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
                <p className="text-[#666666] font-semibold text-sm">
                  Interview Date: {new Date(selectedInterview.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-sm">
                    <span className="font-black text-white text-[10px]">M</span>
                  </div>
                  <span className="font-bold text-sm tracking-tight text-[#111111]">MockMate <span className="text-[#666666]">AI</span></span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}