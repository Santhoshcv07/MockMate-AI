"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import HeroRobot from "@/components/HeroRobot";
import Navbar from "@/components/Navbar";

// --- REUSABLE COMPONENTS ---
const StatCounter = ({ value, label, suffix = "" }: { value: string, label: string, suffix?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    className="flex flex-col items-center md:items-start"
  >
    <div className="text-4xl md:text-5xl font-black text-[#111111] flex items-center tracking-tight">
      {value}<span className="text-[#FF6B35]">{suffix}</span>
    </div>
    <div className="text-[#666666] text-sm md:text-base font-semibold uppercase tracking-widest mt-2">
      {label}
    </div>
  </motion.div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left focus:outline-none">
        <span className="text-lg font-bold text-[#111111]">{question}</span>
        <span className={`text-[#FF6B35] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </span>
      </button>
      <motion.div initial={false} animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} className="overflow-hidden">
        <p className="pt-4 text-[#666666] font-medium leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  );
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <main className="relative min-h-screen bg-white text-[#111111] selection:bg-[#FF6B35]/20 selection:text-[#111111] overflow-hidden font-sans">
      
      {/* --- BACKGROUND GLOWS, GRIDS, & IMAGE LAYER --- */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.2] z-0">
        <img src="/images/ai-bg.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FF6B35] rounded-full blur-[150px] opacity-[0.05] pointer-events-none z-0" />

      {/* --- UNIFIED NAVBAR --- */}
      <Navbar />

      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-8 pb-20 md:pt-10 md:pb-24 px-6 max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col items-start z-20">
            {/* SaaS Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 mb-8 shadow-sm">
              <span className="px-2 py-0.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-[10px] font-black uppercase tracking-widest">New</span>
              <span className="text-xs font-semibold text-[#666666]">Conversational Voice AI is live</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-[#111111]">
              The AI Recruiter that <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]">gets you hired.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#666666] max-w-lg leading-relaxed mb-10 font-medium">
              MockMate AI reads your resume, conducts real-time voice interviews, and delivers granular analytics so you can ace the real thing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/signup" className="flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e65a25] text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_8px_20px_rgba(255,107,53,0.3)] hover:-translate-y-0.5">
                Start Free Interview
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <a href="#how-it-works" className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#111111] px-8 py-4 rounded-full font-bold text-lg transition-all shadow-sm hover:-translate-y-0.5">
                How It Works
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center lg:justify-end mt-10 lg:mt-0 z-20">
            <div className="w-full max-w-[500px] aspect-square relative z-10">
              <HeroRobot />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 2. WHY MOCKMATE (COMPARISON) --- */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="relative z-10 py-24 max-w-7xl mx-auto px-6"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#111111] tracking-tight">The <span className="text-[#FF6B35]">Smart Way</span> to Prepare</h2>
          <p className="text-lg text-[#666666] font-medium">Stop relying on generic leetcode memorization.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-bold text-xl">✕</div>
              <h3 className="text-2xl font-bold text-[#111111]">The Old Way</h3>
            </div>
            <ul className="space-y-5">
              {["Practicing alone in the mirror", "Generic questions from internet lists", "Zero feedback on your communication", "Static, scripted interview formats"].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-[#666666] font-medium">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-[#FF6B35]/30 shadow-[0_20px_50px_rgba(255,107,53,0.15)] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35] blur-[80px] opacity-20 pointer-events-none" />
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center font-bold text-xl">✓</div>
              <h3 className="text-2xl font-bold text-[#111111]">The MockMate Way</h3>
            </div>
            <ul className="space-y-5 relative z-10">
              {["Real-time conversational Voice AI", "Questions tailored to your uploaded Resume", "Granular scoring on Technical & Delivery", "Dynamic follow-ups that test your depth"].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-[#111111] font-bold">
                  <svg className="w-6 h-6 text-[#FF6B35] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>

      {/* --- 3. FEATURES GRID --- */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        id="features" className="relative z-10 py-24 bg-white/40 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#111111]">Everything you need to <br className="hidden md:block"/> ace the interview</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>, title: "Resume Analysis", desc: "Upload your PDF. The AI reads your exact experience and projects to ask highly personalized questions." },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>, title: "Dynamic Follow-Ups", desc: "The AI listens to your answer, evaluates it silently, and asks unscripted follow-up questions." },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>, title: "Radar Skill Analysis", desc: "Visualize your multi-dimensional capabilities. See exactly where your technical vs behavioral strengths lie." },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>, title: "Instant Scoring", desc: "Receive immediate scores on your communication, technical accuracy, and problem-solving skills." },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>, title: "Performance Trends", desc: "Track your progress over time with beautiful data visualizations showing your overall growth." },
              { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>, title: "PDF Reports", desc: "Generate and download professional, recruiter-grade PDF reports of your interview performance." },
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10, scale: 1.03 }} 
                transition={{ duration: 0.2 }} 
                className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(255,107,53,0.15)] group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-[#FF6B35] transition-colors duration-300">
                  <div className="text-[#FF6B35] group-hover:text-white transition-colors duration-300">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#111111]">{feature.title}</h3>
                <p className="text-[#666666] leading-relaxed text-sm font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* --- 5. INTERACTIVE VOICE DEMO HIGHLIGHT --- */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="relative z-10 py-24 bg-[#0F1115] text-white"
      >
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">Speak Naturally. <br/><span className="text-[#FF6B35]">Get Hired.</span></h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Stop typing essays. MockMate utilizes native browser Web Speech APIs to conduct fluid, real-time voice interviews. Just hit record and talk through your system design exactly as you would on a Zoom call.
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3 items-center font-bold text-gray-200"><span className="w-2 h-2 bg-emerald-400 rounded-full"/> Hands-free interviewing</li>
              <li className="flex gap-3 items-center font-bold text-gray-200"><span className="w-2 h-2 bg-amber-400 rounded-full"/> Tests your verbal communication</li>
              <li className="flex gap-3 items-center font-bold text-gray-200"><span className="w-2 h-2 bg-blue-400 rounded-full"/> Auto-transcribes your answers</li>
            </ul>
          </div>

          <div className="bg-[#161920] border border-gray-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Your Response</div>
              <span className="flex items-center gap-2 text-rose-500 text-xs font-bold animate-pulse bg-rose-500/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-rose-500 rounded-full"></span> Listening...
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed min-h-[100px]">
              "For the state management, I decided to use the Context API instead of Redux because the application scale was relatively small, and I wanted to avoid unnecessary boilerplate..."
            </p>
            <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)]">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 1h8v8H6V6z" clipRule="evenodd" /></svg>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- 6. HOW IT WORKS (TIMELINE) --- */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        id="how-it-works" className="relative z-10 py-24 bg-white/30 backdrop-blur-md border-y border-white/50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#111111] tracking-tight">How It Works</h2>
            <p className="text-[#666666] text-lg font-medium">Four simple steps to absolute interview mastery.</p>
          </div>
          
          <div className="relative grid md:grid-cols-4 gap-10">
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            
            {[
              { step: "01", title: "Upload Resume", desc: "Sync your PDF to give the AI your exact career context." },
              { step: "02", title: "Generate Config", desc: "Select your target role, tech stack, and experience level." },
              { step: "03", title: "Speak & Answer", desc: "Engage in a dynamic back-and-forth conversational interview." },
              { step: "04", title: "Get Feedback", desc: "Receive your scores, actionable suggestions, and PDF report." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center bg-transparent">
                <div className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-md border-2 border-[#FF6B35] flex items-center justify-center text-2xl font-black text-[#111111] mb-6 shadow-md shadow-[#FF6B35]/10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#111111]">{item.title}</h3>
                <p className="text-[#666666] text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* --- 7. DASHBOARD SHOWCASE --- */}
      <motion.section 
        initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        id="dashboard" className="relative z-10 py-32 max-w-7xl mx-auto px-6 overflow-hidden"
      >
        <div className="text-center mb-20 relative z-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Recruiter-Grade <span className="text-[#FF6B35]">Analytics</span></h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto font-medium">Don't just practice in the dark. Visualize your weaknesses, track your performance trends, and measure your resume alignment score.</p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto rounded-2xl border border-gray-800 bg-[#0F1115] shadow-[0_25px_80px_rgba(0,0,0,0.15)] hover:scale-[1.02] transition-all duration-500 overflow-hidden">
          <div className="h-12 bg-[#161920] border-b border-gray-800 flex items-center px-4 gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500" />
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-inner">
              <h3 className="font-bold mb-6 text-white tracking-wide">Performance Trend</h3>
              <svg className="w-full h-40" viewBox="0 0 200 50" preserveAspectRatio="none">
                <path d="M0,40 Q25,30 50,35 T100,20 T150,25 T200,5" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="50" cy="35" r="4" fill="#161920" stroke="#FF6B35" strokeWidth="2" />
                <circle cx="100" cy="20" r="4" fill="#161920" stroke="#FF6B35" strokeWidth="2" />
                <circle cx="150" cy="25" r="4" fill="#161920" stroke="#FF6B35" strokeWidth="2" />
                <circle cx="200" cy="5" r="4" fill="#FF6B35" />
              </svg>
            </div>
            
            <div className="col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center shadow-inner">
              <h3 className="font-bold mb-4 w-full text-left text-white tracking-wide">Skill Radar</h3>
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
                  <polygon points="50,5 95,30 80,85 20,85 5,30" fill="none" stroke="#444" strokeWidth="1" strokeDasharray="3 3"/>
                  <polygon points="50,20 80,40 70,75 30,75 20,40" fill="rgba(255,107,53,0.35)" stroke="#FF6B35" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-6 mt-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"><div className="text-3xl font-black text-[#FF6B35]">88%</div><div className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">Match Score</div></div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"><div className="text-3xl font-black text-emerald-400">92%</div><div className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">Tech Score</div></div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"><div className="text-3xl font-black text-cyan-400">85%</div><div className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">Comm Score</div></div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- 8. TESTIMONIALS --- */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="relative z-10 py-24 bg-white/40 backdrop-blur-sm border-y border-white/50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 tracking-tight text-[#111111]">Trusted by Ambitious Engineers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah J.",
                role: "Frontend Developer",
                image: "https://i.pravatar.cc/100?img=12",
                review: "The conversational AI is terrifyingly good. It caught gaps in my communication and helped me improve quickly.",
              },
              {
                name: "Michael T.",
                role: "Data Scientist",
                image: "https://i.pravatar.cc/100?img=32",
                review: "Resume-aware interviews felt incredibly realistic. The feedback reports were extremely detailed.",
              },
              {
                name: "Elena R.",
                role: "Software Engineer",
                image: "https://i.pravatar.cc/100?img=52",
                review: "The radar chart and weakness tracking showed exactly what I needed to improve.",
              },
            ].map((t, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -8, scale: 1.02 }} 
                transition={{ duration: 0.2 }} 
                className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(255,107,53,0.15)]"
              >
                <div className="flex text-[#FF8C42] mb-5">{"★★★★★"}</div>
                <p className="text-[#666666] font-medium mb-8 leading-relaxed text-sm md:text-base">"{t.review}"</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 mt-auto">
                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-white/60 shadow-sm" />
                    <div>
                      <h4 className="font-semibold text-[#111111]">{t.name}</h4>
                      <p className="text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* --- 9. FAQ SECTION --- */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        id="faq" className="relative z-10 py-32 bg-transparent"
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-12 tracking-tight text-[#111111]">Frequently Asked Questions</h2>
          <div className="space-y-2">
            <FAQItem question="Do I need to download or install anything?" answer="No. MockMate AI runs entirely in your browser, utilizing native Web Speech APIs for voice recognition and cloud infrastructure for the AI evaluation." />
            <FAQItem question="How accurate is the AI evaluation?" answer="Extremely accurate. We use the latest LLM models prompted with strict tier-1 tech company grading rubrics to evaluate your technical accuracy and communication clarity." />
            <FAQItem question="Can I practice for non-technical roles?" answer="Yes! While highly optimized for software engineering, you can enter any role (e.g. Product Manager, Marketer) in the setup screen and the AI will adapt perfectly." />
            <FAQItem question="Is my resume data safe?" answer="Absolutely. We use secure Supabase storage with strict Row Level Security. Your data is never used to train public models." />
          </div>
        </div>
      </motion.section>

      {/* --- 10. FINAL CTA --- */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="relative z-10 py-32 overflow-hidden bg-[#111111] text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FF6B35]/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Ready To Ace Your <br/> Next Interview?</h2>
          <p className="text-xl text-gray-400 mb-12 font-medium">Join MockMate AI and start preparing like a top 1% candidate.</p>
          <motion.a 
            href="/signup" 
            animate={{
              boxShadow: [
                "0 0 0px rgba(255,107,53,0.2)",
                "0 0 30px rgba(255,107,53,0.5)",
                "0 0 0px rgba(255,107,53,0.2)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
            className="inline-flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e65a25] text-white px-10 py-5 rounded-full font-black text-xl transition-colors"
          >
            Start Practicing Free
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </motion.a>
        </div>
      </motion.section>

      {/* --- 11. FOOTER --- */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-xl border-t border-white/50 pt-16 pb-8 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-sm">
                <span className="font-black text-white text-xs">M</span>
              </div>
              <span className="font-bold text-lg text-[#111111]">MockMate <span className="text-[#666666]">AI</span></span>
            </div>
            <p className="text-[#666666] font-medium text-sm max-w-sm leading-relaxed">The ultimate AI interview simulator. Practice dynamically, get real-time feedback, and land your dream job with confidence.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#111111]">Product</h4>
            <ul className="space-y-3 text-sm text-[#666666] font-medium">
              <li><Link href="/interview" className="hover:text-[#FF6B35] transition-colors">Start Interview</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#FF6B35] transition-colors">Analytics Dashboard</Link></li>
              <li><Link href="/resume" className="hover:text-[#FF6B35] transition-colors">Resume Sync</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#111111]">Company</h4>
            <ul className="space-y-3 text-sm text-[#666666] font-medium">
              <li><a href="#" className="hover:text-[#FF6B35] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#FF6B35] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#FF6B35] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-medium">© {new Date().getFullYear()} MockMate AI. All rights reserved.</p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#FF6B35] hover:border-[#FF6B35] hover:shadow-sm cursor-pointer transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></div>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#FF6B35] hover:border-[#FF6B35] hover:shadow-sm cursor-pointer transition-all"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></div>
          </div>
        </div>
      </footer>

    </main>
  );
}