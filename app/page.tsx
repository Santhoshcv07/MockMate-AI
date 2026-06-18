"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import HeroRobot from "@/components/HeroRobot";

// --- REUSABLE STAT COUNTER COMPONENT ---
const StatCounter = ({ value, label, suffix = "" }: { value: string, label: string, suffix?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
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

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white text-[#111111] selection:bg-[#FF6B35]/20 selection:text-[#111111] overflow-hidden font-sans">
      
      {/* --- SUBTLE LIGHT GRID BACKGROUND --- */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-[0_4px_10px_rgba(255,107,53,0.3)]">
              <span className="font-black text-white text-xl">M</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#111111]">MockMate <span className="text-[#666666]">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#666666]">
            <a href="#features" className="hover:text-[#111111] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#111111] transition-colors">How It Works</a>
            <a href="#dashboard" className="hover:text-[#111111] transition-colors">Dashboard</a>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-sm font-bold text-[#666666] hover:text-[#111111] transition-colors hidden md:block">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-bold bg-[#111111] text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-md">
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-16 pb-20 md:pt-20 md:pb-24 px-6 max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start z-20"
          >
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="px-4 py-1.5 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-[#FF6B35] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse" /> Resume-Aware
              </span>
              <span className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-[#666666] text-xs font-bold uppercase tracking-widest shadow-sm">
                Voice Interviews
              </span>
              <span className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-[#666666] text-xs font-bold uppercase tracking-widest shadow-sm hidden sm:block">
                AI Follow-Ups
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-[#111111]">
              Master Your Interview with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]">MockMate AI</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#666666] max-w-xl leading-relaxed mb-10 font-medium">
              Practice technical and HR interviews with an advanced AI recruiter. Get personalized questions, real-time feedback, and detailed performance analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/signup" className="flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e65a25] text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_8px_20px_rgba(255,107,53,0.3)] hover:shadow-[0_12px_25px_rgba(255,107,53,0.4)] hover:-translate-y-0.5">
                Start Free Interview
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <a href="#how-it-works" className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#111111] px-8 py-4 rounded-full font-bold text-lg transition-all shadow-sm hover:shadow-md">
                <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Watch Demo
              </a>
            </div>
          </motion.div>

          {/* Right Side: Hero Robot */}
         <div className="hidden lg:block absolute right-[-50px] top-[45%] -translate-y-1/2 w-[500px] h-[500px]">
  <HeroRobot />

</div>
            

        </div>
      </section>

      {/* --- STATISTICS SECTION --- */}
      <section className="relative py-16 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 text-center md:text-left">
          <StatCounter value="10,000" suffix="+" label="Questions Generated" />
          <StatCounter value="95" suffix="%" label="Interview Accuracy" />
          <StatCounter value="24/7" label="AI Availability" />
          <StatCounter value="100" suffix="%" label="Resume-Aware" />
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-32 relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-[#111111]">Engineered for the Modern <br className="hidden md:block"/> Job Market</h2>
          <p className="text-lg text-[#666666] font-medium">Stop memorizing scripts. Start having real, dynamic conversations with an AI that adapts to your resume and responses.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>, title: "Voice Interview Mode", desc: "Speak your answers naturally. Our native Speech API captures your response in real-time, simulating a live Zoom interview." },
            { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>, title: "Resume Analysis", desc: "Upload your PDF. The AI reads your exact experience and projects to ask highly personalized, context-aware questions." },
            { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>, title: "Dynamic Follow-Ups", desc: "The AI listens to your answer, evaluates it silently, and asks unscripted follow-up questions to test your depth." },
            { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>, title: "Performance Trends", desc: "Track your progress over time with beautiful data visualizations showing your overall, technical, and communication scores." },
            { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>, title: "Radar Skill Analysis", desc: "Visualize your multi-dimensional capabilities. See exactly where your technical vs behavioral strengths lie at a glance." },
            { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>, title: "PDF Reports", desc: "Generate and download professional, recruiter-grade PDF reports of your interview performance to share with mentors." },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-[#FF6B35] transition-colors duration-300">
                <div className="text-[#FF6B35] group-hover:text-white transition-colors duration-300">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#111111]">{feature.title}</h3>
              <p className="text-[#666666] leading-relaxed text-sm font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS (TIMELINE) --- */}
      <section id="how-it-works" className="py-24 relative bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#111111] tracking-tight">How It Works</h2>
            <p className="text-[#666666] text-lg font-medium">Four simple steps to absolute interview mastery.</p>
          </div>
          
          <div className="relative grid md:grid-cols-4 gap-10">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            
            {[
              { step: "01", title: "Upload Resume", desc: "Sync your PDF to give the AI your exact career context." },
              { step: "02", title: "Generate Config", desc: "Select your target role, tech stack, and experience level." },
              { step: "03", title: "Speak & Answer", desc: "Engage in a dynamic back-and-forth conversational interview." },
              { step: "04", title: "Get Feedback", desc: "Receive your scores, actionable suggestions, and PDF report." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center bg-transparent"
              >
                <div className="w-20 h-20 rounded-full bg-white border-2 border-[#FF6B35] flex items-center justify-center text-2xl font-black text-[#111111] mb-6 shadow-md shadow-[#FF6B35]/10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#111111]">{item.title}</h3>
                <p className="text-[#666666] text-sm leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- DASHBOARD SHOWCASE (DARK UI ON LIGHT BACKGROUND) --- */}
      <section id="dashboard" className="py-32 relative max-w-7xl mx-auto px-6 overflow-hidden">
        <div className="text-center mb-20 relative z-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Recruiter-Grade <span className="text-[#FF6B35]">Analytics</span></h2>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto font-medium">Don't just practice in the dark. Visualize your weaknesses, track your performance trends, and measure your resume alignment score.</p>
        </div>

        {/* Huge Floating Dark Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-full max-w-5xl mx-auto rounded-2xl border border-gray-800 bg-[#0F1115] shadow-[0_30px_60px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          {/* macOS Window Bar */}
          <div className="h-12 bg-[#161920] border-b border-gray-800 flex items-center px-4 gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500" />
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
            <div className="mx-auto text-xs font-bold text-gray-500 uppercase tracking-widest -ml-12">MockMate Dashboard</div>
          </div>
          
          {/* Mockup Grid */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mock Chart */}
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
            
            {/* Mock Radar */}
            <div className="col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center shadow-inner">
              <h3 className="font-bold mb-4 w-full text-left text-white tracking-wide">Skill Radar</h3>
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
                  <polygon points="50,5 95,30 80,85 20,85 5,30" fill="none" stroke="#444" strokeWidth="1" strokeDasharray="3 3"/>
                  <polygon points="50,20 80,40 70,75 30,75 20,40" fill="rgba(255,107,53,0.35)" stroke="#FF6B35" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Mock Scores */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-6 mt-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"><div className="text-3xl font-black text-[#FF6B35]">88%</div><div className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">Match Score</div></div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"><div className="text-3xl font-black text-emerald-400">92%</div><div className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">Tech Score</div></div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"><div className="text-3xl font-black text-cyan-400">85%</div><div className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">Comm Score</div></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 tracking-tight text-[#111111]">Trusted by Ambitious Engineers</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", role: "Frontend Developer", text: "The conversational AI is terrifyingly good. It caught me off guard with follow-up questions about my state management choices exactly like my real Google interview did." },
              { name: "Michael T.", role: "Data Scientist", text: "I used to freeze during system design questions. Practicing with voice mode on MockMate completely cured my interview anxiety. Landed my dream job!" },
              { name: "Elena R.", role: "Senior Engineer", text: "The radar chart and PDF reports are brilliant. Being able to visualize exactly where my communication skills were lacking gave me the exact roadmap I needed." }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex text-[#FF8C42] mb-5">{"★★★★★"}</div>
                <p className="text-[#666666] font-medium mb-8 leading-relaxed text-sm md:text-base">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 border border-gray-300" />
                  <div>
                    <h4 className="font-bold text-sm text-[#111111]">{t.name}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-32 relative overflow-hidden bg-white border-t border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FF6B35]/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-[#111111] tracking-tight">Ready To Ace Your <br/> Next Interview?</h2>
          <p className="text-xl text-[#666666] mb-12 font-medium">Join MockMate AI and start preparing like a top 1% candidate.</p>
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e65a25] text-white px-10 py-5 rounded-full font-black text-xl transition-all shadow-[0_8px_25px_rgba(255,107,53,0.3)] hover:shadow-[0_15px_35px_rgba(255,107,53,0.4)] hover:-translate-y-1">
            Start Free Interview
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-200 bg-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-sm">
                <span className="font-black text-white text-xs">M</span>
              </div>
              <span className="font-bold text-lg text-[#111111]">MockMate <span className="text-[#666666]">AI</span></span>
            </div>
            <p className="text-[#666666] font-medium text-sm max-w-sm">The ultimate AI interview simulator. Practice dynamically, get real-time feedback, and land your dream job.</p>
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
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#111111] cursor-pointer transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#111111] cursor-pointer transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></div>
          </div>
        </div>
      </footer>

    </div>
  );
}