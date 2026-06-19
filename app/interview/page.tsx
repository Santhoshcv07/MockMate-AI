"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import DashboardNavbar from "@/components/layout/DashboardNavbar";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Step = "setup" | "loading" | "interview" | "feedback";

interface Message {
  role: "ai" | "user";
  content: string;
}

export default function InterviewPage() {
  const router = useRouter();
  
  // Auth
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Core UI States
  const [step, setStep] = useState<Step>("setup");
  const [loadingMessage, setLoadingMessage] = useState("");

  // Setup States
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("Junior");
  const [techStack, setTechStack] = useState("");
  const [interviewLength, setInterviewLength] = useState<number>(5);

  // Conversational States
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Feedback State
  const [feedback, setFeedback] = useState({
    overallScore: 0,
    technicalScore: 0,
    communicationScore: 0,
    strengths: [] as string[],
    weaknesses: [] as string[],
    suggestions: [] as string[],
  });

  // 1. Check Authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) router.push("/login");
      else {
        setUserId(session.user.id);
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  // 2. Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
          }
          if (finalTranscript) {
            setCurrentAnswer((prev) => prev + (prev.trim() ? " " : "") + finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') alert("Microphone access denied.");
          setIsRecording(false);
        };

        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // 3. Start Interview & Fetch First Question
  const startInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !techStack) return alert("Please fill out all fields.");

    setStep("loading");
    setLoadingMessage("MockMate AI is reviewing your profile and preparing your first question...");

    const prompt = `You are an expert technical interviewer. The candidate is interviewing for a ${experience} ${role} role, specializing in ${techStack}. 
    Ask the very first interview question. Keep it concise, engaging, and professional. Do NOT include greetings like "Hi" or "Sure, here is a question". Just output the exact question text.`;

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages([{ role: "ai", content: data.text.trim() }]);
      setQuestionCount(1);
      setStep("interview");
    } catch (err: any) {
      alert(`Setup Failed: ${err.message}`);
      setStep("setup");
    }
  };

  // 4. Handle User Answer & Fetch Next Follow-up
  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const newMessages: Message[] = [...messages, { role: "user", content: currentAnswer.trim() }];
    setMessages(newMessages);
    setCurrentAnswer("");
    setIsProcessing(true);

    // If we reached the target length, generate final feedback
    if (questionCount >= interviewLength && interviewLength !== 999) {
      await generateFinalFeedback(newMessages);
      return;
    }

    // Otherwise, fetch the next follow-up question
    const transcript = newMessages.map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n\n');
    
    const prompt = `You are a professional technical interviewer conducting a mock interview for a ${experience} ${role} role using ${techStack}.
    Here is the interview transcript so far:
    
    <transcript>
    ${transcript}
    </transcript>
    
    The candidate just answered your last question. 
    Analyze their answer silently. Then, ask ONE logical follow-up question based directly on what they just said, or introduce a new technical concept related to their stack.
    If their answer was poor, ask them to clarify. If it was good, push deeper into a related advanced topic. 
    Do NOT break character. Do NOT say "Great answer" every time. Do NOT output anything other than the exact next question text. Keep it under 3 sentences.`;

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages([...newMessages, { role: "ai", content: data.text.trim() }]);
      setQuestionCount(prev => prev + 1);
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate follow-up question. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Final Feedback Generation
  const generateFinalFeedback = async (finalTranscriptMsgs: Message[]) => {
    setStep("loading");
    setLoadingMessage("Analyzing your conversation history and generating your comprehensive scorecard...");

    const transcript = finalTranscriptMsgs.map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n\n');

    const prompt = `You are an expert hiring manager evaluating a candidate for a ${experience} ${role} role (${techStack}).
    Review the following complete interview transcript:
    
    <transcript>
    ${transcript}
    </transcript>

    Provide a strict, highly detailed performance evaluation. You MUST respond ONLY with a valid JSON object matching this exact structure:
    {
      "overallScore": 85,
      "technicalScore": 80,
      "communicationScore": 90,
      "strengths": ["list item 1", "list item 2"],
      "weaknesses": ["list item 1", "list item 2"],
      "suggestions": ["list item 1", "list item 2"]
    }
    Do not include markdown blocks like \`\`\`json. Return ONLY the raw JSON object.`;

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const cleanedText = data.text.replace(/```json|```/gi, "").trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse JSON evaluation from the AI.");
      
      const parsedFeedback = JSON.parse(jsonMatch[0]);
      setFeedback(parsedFeedback);
      setStep("feedback");

      // SECURE DB PERSISTENCE
      await supabaseClient.from("interviews").insert([{
        user_id: userId,
        job_role: role,
        experience_level: experience,
        tech_stack: techStack,
        overall_score: parsedFeedback.overallScore,
        technical_score: parsedFeedback.technicalScore,
        communication_score: parsedFeedback.communicationScore,
        strengths: parsedFeedback.strengths,
        weaknesses: parsedFeedback.weaknesses,
        suggestions: parsedFeedback.suggestions,
      }]);

    } catch (err: any) {
      console.error(err);
      alert(`Evaluation Error: ${err.message}`);
      setStep("setup");
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return alert("Your browser does not support Voice Recording. Try Chrome or Edge.");
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  if (isAuthChecking) return <div className="min-h-screen bg-[#FAFAFA]" />;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } as any }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } as any }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans pt-24 pb-6 px-4 md:pt-32 md:pb-12 md:px-8 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* AUTHENTICATED NAVBAR */}
      <DashboardNavbar />

      {/* BACKGROUND GLOWS & GRIDS (Landing Page Match) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <img src="/images/ai-bg.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF6B35] rounded-full blur-[200px] opacity-[0.05] pointer-events-none z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-xl shadow-black/5 p-6 md:p-10 z-10 flex flex-col max-h-[85vh] mx-auto"
      >
        
        {/* SETUP STEP */}
        {step === "setup" && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="overflow-y-auto custom-scrollbar overflow-x-hidden p-2">
            
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {[
                { text: "Resume Aware", icon: "📄" },
                { text: "AI Voice Interview", icon: "🎙️" },
                { text: "Performance Analytics", icon: "📊" }
              ].map((badge, i) => (
                <span key={i} className="px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-[#FF6B35] text-xs font-bold uppercase tracking-widest shadow-sm flex items-center gap-2">
                  <span>{badge.icon}</span> {badge.text}
                </span>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-black mb-3 tracking-tight text-[#111111]">
                Configure <span className="text-[#FF6B35]">Interview</span>
              </h2>
              <p className="text-[#666666] text-lg font-medium">
                Tailor your conversational AI interviewer to your exact target role.
              </p>
            </motion.div>
            
            <form onSubmit={startInterview} className="space-y-6 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Floating Label Input: Job Role */}
                <motion.div variants={itemVariants} className="relative">
                  <input
                    id="jobRole"
                    type="text"
                    required
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder=" "
                    className="peer w-full h-14 px-5 pt-5 pb-2 bg-white border border-gray-200 rounded-2xl text-[#111111] font-medium focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/20 focus:outline-none transition-all shadow-sm"
                  />
                  <label htmlFor="jobRole" className={`absolute left-5 top-4 text-gray-400 pointer-events-none transition-all duration-300
                    ${role ? 'text-[10px] -translate-y-2.5 font-bold uppercase tracking-wide' : 'text-sm font-medium'}
                    peer-focus:text-[10px] peer-focus:-translate-y-2.5 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-[#FF6B35]
                  `}>
                    Job Role (e.g. Frontend Engineer)
                  </label>
                </motion.div>

                {/* Floating Label Select: Experience Level */}
                <motion.div variants={itemVariants} className="relative">
                  <select
                    id="experience"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    className="peer w-full h-14 px-5 pt-5 pb-2 bg-white border border-gray-200 rounded-2xl text-[#111111] font-bold focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/20 focus:outline-none transition-all appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="Junior">Junior (0-2 years)</option>
                    <option value="Mid-Level">Mid-Level (2-5 years)</option>
                    <option value="Senior">Senior (5+ years)</option>
                  </select>
                  <label htmlFor="experience" className="absolute left-5 top-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 pointer-events-none transition-all duration-300 peer-focus:text-[#FF6B35]">
                    Experience Level
                  </label>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 peer-focus:text-[#FF6B35] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </motion.div>

              </div>

              {/* Floating Label Input: Tech Stack */}
              <motion.div variants={itemVariants} className="relative">
                <input
                  id="techStack"
                  type="text"
                  required
                  value={techStack}
                  onChange={e => setTechStack(e.target.value)}
                  placeholder=" "
                  className="peer w-full h-14 px-5 pt-5 pb-2 bg-white border border-gray-200 rounded-2xl text-[#111111] font-medium focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/20 focus:outline-none transition-all shadow-sm"
                />
                <label htmlFor="techStack" className={`absolute left-5 top-4 text-gray-400 pointer-events-none transition-all duration-300
                  ${techStack ? 'text-[10px] -translate-y-2.5 font-bold uppercase tracking-wide' : 'text-sm font-medium'}
                  peer-focus:text-[10px] peer-focus:-translate-y-2.5 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-[#FF6B35]
                `}>
                  Technology Stack (e.g. React, Node.js, AWS)
                </label>
              </motion.div>

              {/* Floating Label Select: Interview Length */}
              <motion.div variants={itemVariants} className="relative">
                <select
                  id="interviewLength"
                  value={interviewLength}
                  onChange={e => setInterviewLength(Number(e.target.value))}
                  className="peer w-full h-14 px-5 pt-5 pb-2 bg-white border border-gray-200 rounded-2xl text-[#111111] font-bold focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/20 focus:outline-none transition-all appearance-none shadow-sm cursor-pointer"
                >
                  <option value={5}>Short (5 Questions)</option>
                  <option value={10}>Standard (10 Questions)</option>
                  <option value={999}>Endless Practice Mode</option>
                </select>
                <label htmlFor="interviewLength" className="absolute left-5 top-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 pointer-events-none transition-all duration-300 peer-focus:text-[#FF6B35]">
                  Interview Length
                </label>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 peer-focus:text-[#FF6B35] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.03 }} 
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="w-full bg-[#FF6B35] text-white h-16 rounded-2xl font-black text-lg shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3"
                >
                  Start Conversational Interview
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        )}

        {/* LOADING STEP */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
              className="w-16 h-16 border-4 border-gray-100 border-t-[#FF6B35] rounded-full shadow-sm" 
            />
            <h3 className="text-2xl font-bold text-[#111111] tracking-tight">AI Processing...</h3>
            <p className="text-[#666666] font-medium max-w-sm mx-auto">{loadingMessage}</p>
          </div>
        )}

        {/* INTERVIEW CHAT STEP */}
        {step === "interview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full flex-grow overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-[#10B981] rounded-full animate-pulse shadow-sm"></span>
                <h3 className="font-black text-xl text-[#111111]">AI Recruiter</h3>
              </div>
              <div className="flex items-center gap-4">
                {interviewLength !== 999 && (
                  <span className="text-xs text-[#666666] font-bold bg-gray-50 px-4 py-2 rounded-full border border-gray-200 uppercase tracking-widest">
                    Question <strong className="text-[#FF6B35] text-sm">{questionCount}</strong> / {interviewLength}
                  </span>
                )}
                {interviewLength === 999 && (
                  <button onClick={() => generateFinalFeedback(messages)} disabled={isProcessing} className="text-xs bg-rose-50 text-[#EF4444] hover:bg-rose-100 border border-rose-200 px-4 py-2 rounded-full font-bold uppercase tracking-widest transition-colors disabled:opacity-50">
                    End & Evaluate
                  </button>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-6 pr-4 pb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-[24px] p-6 shadow-sm ${
                    msg.role === 'ai' 
                    ? 'bg-white border border-gray-100 text-[#111111] rounded-tl-sm' 
                    : 'bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] text-white rounded-tr-sm shadow-orange-500/20'
                  }`}>
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-[24px] rounded-tl-sm p-6 shadow-sm flex gap-2 items-center">
                    <span className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2.5 h-2.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="pt-5 border-t border-gray-200 flex-shrink-0 mt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest">Your Response</span>
                {isRecording && (
                  <span className="flex items-center gap-1.5 text-[#EF4444] text-xs font-bold animate-pulse bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    <span className="w-2 h-2 bg-[#EF4444] rounded-full"></span> Listening
                  </span>
                )}
              </div>
              
              <div className="relative flex items-end gap-3">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={isProcessing}
                  placeholder={isProcessing ? "AI is typing..." : "Type your answer or use the microphone..."}
                  className="w-full h-24 bg-white border border-gray-200 rounded-2xl p-4 text-[#111111] font-medium text-sm focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-[#FF6B35]/20 transition-all resize-none custom-scrollbar disabled:bg-gray-50 disabled:text-gray-400 shadow-sm"
                />
                
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleRecording} 
                    disabled={isProcessing} 
                    className={`p-4 rounded-2xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                      isRecording ? "bg-red-50 border border-red-200 text-[#EF4444] shadow-inner" : "bg-white hover:bg-gray-50 border border-gray-200 text-[#666666] hover:text-[#111111] shadow-sm"
                    }`}
                  >
                    {isRecording ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 1h8v8H6V6z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    )}
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitAnswer} 
                    disabled={!currentAnswer.trim() || isProcessing} 
                    className="p-4 bg-[#FF6B35] hover:bg-[#e65a25] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl transition-all shadow-md flex items-center justify-center disabled:shadow-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* FEEDBACK STEP */}
        {step === "feedback" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 overflow-y-auto custom-scrollbar p-2">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-black mb-3 tracking-tight text-[#111111]">Interview <span className="text-[#FF6B35]">Analysis</span></h2>
              <p className="text-[#666666] text-lg font-medium">Your AI generated evaluation report card is ready.</p>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-4xl md:text-5xl font-black text-[#FF6B35]">{feedback.overallScore}%</div>
                <div className="text-[10px] md:text-xs uppercase tracking-widest text-[#666666] font-bold mt-3">Overall</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-4xl md:text-5xl font-black text-[#10B981]">{feedback.technicalScore}%</div>
                <div className="text-[10px] md:text-xs uppercase tracking-widest text-[#666666] font-bold mt-3">Technical</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="text-4xl md:text-5xl font-black text-cyan-500">{feedback.communicationScore}%</div>
                <div className="text-[10px] md:text-xs uppercase tracking-widest text-[#666666] font-bold mt-3">Delivery</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl shadow-sm">
                <h4 className="text-[#10B981] text-xl font-bold mb-4 flex items-center gap-3">
                  <span className="bg-emerald-100 p-1.5 rounded-lg text-sm">✅</span> Key Strengths
                </h4>
                <ul className="space-y-3 text-[#111111] text-sm md:text-base font-medium">
                  {feedback.strengths.map((str, i) => <li key={i} className="flex gap-3"><span className="text-[#10B981] mt-0.5">•</span> {str}</li>)}
                </ul>
              </div>

              <div className="bg-red-50 border border-red-100 p-8 rounded-3xl shadow-sm">
                <h4 className="text-[#EF4444] text-xl font-bold mb-4 flex items-center gap-3">
                  <span className="bg-red-100 p-1.5 rounded-lg text-sm">🎯</span> Areas for Improvement
                </h4>
                <ul className="space-y-3 text-[#111111] text-sm md:text-base font-medium">
                  {feedback.weaknesses.map((weak, i) => <li key={i} className="flex gap-3"><span className="text-[#EF4444] mt-0.5">•</span> {weak}</li>)}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl shadow-sm">
                <h4 className="text-blue-500 text-xl font-bold mb-4 flex items-center gap-3">
                  <span className="bg-blue-100 p-1.5 rounded-lg text-sm">💡</span> Action Plan
                </h4>
                <ul className="space-y-3 text-[#111111] text-sm md:text-base font-medium">
                  {feedback.suggestions.map((sug, i) => <li key={i} className="flex gap-3"><span className="text-blue-500 mt-0.5">→</span> {sug}</li>)}
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <Link href="/dashboard" className="flex-1 bg-[#FF6B35] hover:bg-[#e65a25] text-white text-center py-5 rounded-2xl font-black text-lg transition-all shadow-lg shadow-orange-500/20 hover:scale-[1.02]">
                View Dashboard Report
              </Link>
              <button onClick={() => { setMessages([]); setQuestionCount(0); setStep("setup"); }} className="flex-1 bg-white hover:bg-gray-50 text-[#111111] py-5 rounded-2xl font-black text-lg transition-all border border-gray-200 shadow-sm hover:scale-[1.02]">
                Start New Session
              </button>
            </div>
          </motion.div>
        )}

      </motion.div>
    </main>
  );
}