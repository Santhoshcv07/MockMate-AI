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

  if (isAuthChecking) return <div className="min-h-screen bg-[#0f1115]" />;

  return (
    <main className="min-h-screen bg-[#0f1115] text-white p-4 pt-24 md:p-8 md:pt-32 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* AUTHENTICATED NAVBAR */}
      <DashboardNavbar />

      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ff5722] rounded-full blur-[200px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#ff5722] rounded-full blur-[150px] opacity-5 pointer-events-none" />
      
      <div className="w-full max-w-4xl bg-[#161920]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl z-10 flex flex-col max-h-[85vh]">
        
        {/* SETUP STEP */}
        {step === "setup" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-y-auto custom-scrollbar">
            <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Configure Interview</h2>
            <p className="text-gray-400 mb-8">Tailor your conversational AI interviewer to your exact target role.</p>
            
            <form onSubmit={startInterview} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Role</label>
                  <input type="text" placeholder="e.g. Frontend Developer" value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff5722] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                  <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full bg-[#1e222b] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff5722] transition-colors">
                    <option value="Junior">Junior (0-2 years)</option>
                    <option value="Mid-Level">Mid-Level (2-5 years)</option>
                    <option value="Senior">Senior (5+ years)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Technology Stack / Skills</label>
                <input type="text" placeholder="e.g. React, Node.js, AWS" value={techStack} onChange={(e) => setTechStack(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff5722] transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Interview Length</label>
                <select value={interviewLength} onChange={(e) => setInterviewLength(Number(e.target.value))} className="w-full bg-[#1e222b] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff5722] transition-colors">
                  <option value={5}>Short (5 Questions)</option>
                  <option value={10}>Standard (10 Questions)</option>
                  <option value={999}>Endless Practice Mode</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-[#ff5722] hover:bg-[#e64a19] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#ff5722]/20 mt-4">
                Start Conversational Interview
              </button>
            </form>
          </motion.div>
        )}

        {/* LOADING STEP */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-5">
            <div className="w-14 h-14 border-4 border-[#ff5722] border-t-transparent rounded-full animate-spin" />
            <p className="text-xl text-gray-300 font-medium tracking-wide">{loadingMessage}</p>
          </div>
        )}

        {/* INTERVIEW CHAT STEP */}
        {step === "interview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full flex-grow overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                <h3 className="font-bold text-lg">AI Recruiter</h3>
              </div>
              <div className="flex items-center gap-4">
                {interviewLength !== 999 && (
                  <span className="text-sm text-gray-400 font-medium bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Question <strong className="text-white">{questionCount}</strong> / {interviewLength}
                  </span>
                )}
                {interviewLength === 999 && (
                  <button onClick={() => generateFinalFeedback(messages)} disabled={isProcessing} className="text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-full font-bold transition-colors disabled:opacity-50">
                    End & Evaluate
                  </button>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-6 pr-2 pb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-5 ${
                    msg.role === 'ai' 
                    ? 'bg-white/5 border border-white/10 text-gray-100 rounded-tl-none shadow-sm' 
                    : 'bg-gradient-to-br from-[#ff5722] to-[#e64a19] text-white rounded-tr-none shadow-md'
                  }`}>
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-5 flex gap-2 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="pt-4 border-t border-white/10 flex-shrink-0 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Response</span>
                {isRecording && (
                  <span className="flex items-center gap-1.5 text-rose-500 text-xs font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Listening
                  </span>
                )}
              </div>
              
              <div className="relative flex items-end gap-3">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={isProcessing}
                  placeholder={isProcessing ? "AI is typing..." : "Type your answer or use the microphone..."}
                  className="w-full h-24 bg-black/20 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#ff5722] transition-colors resize-none custom-scrollbar disabled:opacity-50"
                />
                
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={toggleRecording} disabled={isProcessing} className={`p-3.5 rounded-full transition-all flex items-center justify-center disabled:opacity-50 ${
                    isRecording ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]" : "bg-white/10 hover:bg-white/20 border border-white/10"
                  }`}>
                    {isRecording ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 1h8v8H6V6z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    )}
                  </button>
                  
                  <button onClick={submitAnswer} disabled={!currentAnswer.trim() || isProcessing} className="p-3.5 bg-[#ff5722] hover:bg-[#e64a19] disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-full transition-all shadow-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* FEEDBACK STEP */}
        {step === "feedback" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 overflow-y-auto custom-scrollbar">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-1 tracking-tight">Interview Analysis</h2>
              <p className="text-gray-400 text-sm">Your AI generated evaluation report card is ready.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg">
                <div className="text-3xl font-black text-[#ff5722]">{feedback.overallScore}%</div>
                <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mt-2">Overall</div>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg">
                <div className="text-3xl font-black text-emerald-400">{feedback.technicalScore}%</div>
                <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mt-2">Technical</div>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg">
                <div className="text-3xl font-black text-blue-400">{feedback.communicationScore}%</div>
                <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mt-2">Delivery</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl">
                <h4 className="text-emerald-400 font-bold mb-3 flex items-center gap-2"><span>✅</span> Key Strengths</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  {feedback.strengths.map((str, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">•</span> {str}</li>)}
                </ul>
              </div>

              <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-2xl">
                <h4 className="text-rose-400 font-bold mb-3 flex items-center gap-2"><span>🎯</span> Areas for Improvement</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  {feedback.weaknesses.map((weak, i) => <li key={i} className="flex gap-2"><span className="text-rose-500">•</span> {weak}</li>)}
                </ul>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl">
                <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2"><span>💡</span> Action Plan</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  {feedback.suggestions.map((sug, i) => <li key={i} className="flex gap-2"><span className="text-blue-500">→</span> {sug}</li>)}
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <Link href="/dashboard" className="flex-1 bg-[#ff5722] hover:bg-[#e64a19] text-white text-center py-4 rounded-xl font-bold transition-all shadow-lg">
                View Dashboard Report
              </Link>
              <button onClick={() => { setMessages([]); setQuestionCount(0); setStep("setup"); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold transition-all border border-white/10">
                Start New Session
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </main>
  );
}