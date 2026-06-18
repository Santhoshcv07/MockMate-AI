"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";

type Step = "setup" | "loading" | "interview" | "feedback";

export default function InterviewPage() {
  const router = useRouter();
  
  // Auth States
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Navigation & UI States
  const [step, setStep] = useState<Step>("setup");
  const [loadingMessage, setLoadingMessage] = useState("");

  // Setup Form States
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("Junior");
  const [techStack, setTechStack] = useState("");

  // Interview Progression States
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");

  // Feedback Results States
  const [feedback, setFeedback] = useState({
    overallScore: 0,
    technicalScore: 0,
    communicationScore: 0,
    strengths: [] as string[],
    weaknesses: [] as string[],
    suggestions: [] as string[],
  });

  // GATEKEEPER: Ensure the user is logged in before showing the page
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUserId(session.user.id);
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  const startInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !techStack) return alert("Please fill out all fields.");

    setStep("loading");
    setLoadingMessage("MockMate AI is crafting your custom interview questions...");

    const prompt = `You are an expert interviewer. Generate exactly 3 technical and behavioral interview questions for a ${experience} ${role} specializing in ${techStack}. 
    Respond ONLY with a valid JSON array of strings. Do not include markdown formatting, introductions, or conversational filler.
    Example format: ["Question 1", "Question 2", "Question 3"]`;

    try {
      const {
  data: { session },
} = await supabaseClient.auth.getSession();
      const res = await fetch("/api/chat", {
        method: "POST",
       headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${session?.access_token}`,
},
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      
      // Robust Error Parsing: Handle 500 backend payloads explicitly
      if (!res.ok) {
        throw new Error(data.error || `Server returned response code: ${res.status}`);
      }

      if (!data?.text) {
        throw new Error("No response content text received from Gemini.");
      }

      const cleanedText = data.text.replace(/```json|```/gi, "").trim();
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) throw new Error("Failed to isolate JSON array formatting structures from AI.");
      
      const parsedQuestions = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new Error("Extracted dataset failed array validation requirements.");
      }

      setQuestions(parsedQuestions);
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setStep("interview");
    } catch (err: any) {
      console.error(err);
      alert(`Interview Setup Failed: ${err.message || "Please check server logs."}`);
      setStep("setup");
    }
  };

  const handleNextQuestion = () => {
    const updatedAnswers = [...answers, currentAnswer || "No answer provided."];
    setAnswers(updatedAnswers);
    setCurrentAnswer("");

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      generateFinalFeedback(updatedAnswers);
    }
  };

  const generateFinalFeedback = async (finalAnswers: string[]) => {
    setStep("loading");
    setLoadingMessage("Analyzing your answers and generating your scorecard...");

    let dynamicReviewPrompt = `You are a professional hiring manager evaluating a candidate for a ${experience} ${role} role (${techStack}).
    Review these interview questions and candidate answers: \n\n`;

    questions.forEach((q, i) => {
      dynamicReviewPrompt += `Question ${i + 1}: ${q}\nAnswer ${i + 1}: ${finalAnswers[i]}\n\n`;
    });

    dynamicReviewPrompt += `Provide a comprehensive performance evaluation. You must respond ONLY with a single JSON object matching this exact structure:
    {
      "overallScore": 85,
      "technicalScore": 80,
      "communicationScore": 90,
      "strengths": ["list item 1", "list item 2"],
      "weaknesses": ["list item 1", "list item 2"],
      "suggestions": ["list item 1", "list item 2"]
    }
    Do not wrap your response in markdown code blocks. Return only the raw JSON object.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: dynamicReviewPrompt }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Evaluation backend returned status code: ${res.status}`);
      }

      const cleanedText = data.text.replace(/```json|```/gi, "").trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error("Failed to isolate JSON summary formatting structures from AI.");
      
      const parsedFeedback = JSON.parse(jsonMatch[0]);
      
      setFeedback(parsedFeedback);
      setStep("feedback");

      // SECURE DB PERSISTENCE
      const { error: dbError } = await supabaseClient.from("interviews").insert([
        {
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
        }
      ]);

      if (dbError) throw dbError;

    } catch (err: any) {
      console.error(err);
      alert(`Evaluation Engine Error: ${err.message || "Please check connection contexts."}`);
      setStep("setup");
    }
  };

  if (isAuthChecking) {
    return <div className="min-h-screen bg-[#0f1115]" />;
  }

  return (
    <main className="min-h-screen bg-[#0f1115] text-white p-4 md:p-8 flex items-center justify-center relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff5722] rounded-full blur-[180px] opacity-10 pointer-events-none" />
      
      <div className="w-full max-w-3xl bg-[#161920]/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl">
        
        {step === "setup" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-3xl font-bold mb-2">Configure Mock Interview</h2>
            <p className="text-gray-400 mb-8">Tailor your AI interviewer session to target your target stack.</p>
            
            <form onSubmit={startInterview} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Job Role</label>
                <input 
                  type="text" 
                  placeholder="e.g. Frontend Developer, Data Analyst" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#1e222b] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff5722] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                <select 
                  value={experience} 
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-[#1e222b] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff5722] transition-colors"
                >
                  <option value="Junior">Junior (0-2 years)</option>
                  <option value="Mid-Level">Mid-Level (2-5 years)</option>
                  <option value="Senior">Senior (5+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Technology Stack / Skills</label>
                <input 
                  type="text" 
                  placeholder="e.g. React, Next.js, Python, SQL" 
                  value={techStack} 
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full bg-[#1e222b] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff5722] transition-colors"
                />
              </div>

              <button type="submit" className="w-full bg-[#ff5722] hover:bg-[#e64a19] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#ff5722]/20">
                Generate AI Interview
              </button>
            </form>
          </motion.div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#ff5722] border-t-transparent rounded-full animate-spin" />
            <p className="text-lg text-gray-300 font-medium">{loadingMessage}</p>
          </div>
        )}

        {step === "interview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <span className="text-xs uppercase tracking-widest bg-gray-800 px-3 py-1 rounded-full text-gray-400 font-semibold">
                Live Simulation
              </span>
              <span className="text-sm text-gray-400">
                Question <strong className="text-[#ff5722]">{currentQuestionIndex + 1}</strong> of {questions.length}
              </span>
            </div>

            <div className="bg-[#1e222b] p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-semibold leading-relaxed text-gray-100">
                {questions[currentQuestionIndex]}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Your Answer</label>
              <textarea 
                rows={6}
                placeholder="Type your structured technical answer or conversational response here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="w-full bg-[#1e222b] border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-[#ff5722] transition-colors resize-none placeholder-gray-600"
              />
            </div>

            <button onClick={handleNextQuestion} className="w-full bg-[#ff5722] hover:bg-[#e64a19] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#ff5722]/20">
              {currentQuestionIndex + 1 === questions.length ? "Submit Interview" : "Next Question"}
            </button>
          </motion.div>
        )}

        {step === "feedback" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-1">Interview Analysis</h2>
              <p className="text-gray-400 text-sm">Your AI generated evaluation report card is ready.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-[#1e222b] p-4 rounded-xl border border-gray-800">
                <div className="text-3xl font-black text-[#ff5722]">{feedback.overallScore}%</div>
                <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-1">Overall</div>
              </div>
              <div className="bg-[#1e222b] p-4 rounded-xl border border-gray-800">
                <div className="text-3xl font-black text-emerald-400">{feedback.technicalScore}%</div>
                <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-1">Technical</div>
              </div>
              <div className="bg-[#1e222b] p-4 rounded-xl border border-gray-800">
                <div className="text-3xl font-black text-blue-400">{feedback.communicationScore}%</div>
                <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-1">Delivery</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-emerald-400 font-bold mb-2 text-sm uppercase tracking-wide">Key Strengths</h4>
                <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
                  {feedback.strengths.map((str, index) => <li key={index}>{str}</li>)}
                </ul>
              </div>

              <div>
                <h4 className="text-rose-400 font-bold mb-2 text-sm uppercase tracking-wide">Areas of Improvement</h4>
                <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
                  {feedback.weaknesses.map((weak, index) => <li key={index}>{weak}</li>)}
                </ul>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h4 className="text-amber-400 font-bold mb-2 text-sm uppercase tracking-wide">Action Plan & Recommendations</h4>
                <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
                  {feedback.suggestions.map((sug, index) => <li key={index}>{sug}</li>)}
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <button onClick={() => setStep("setup")} className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition-all text-sm mb-3">
                Try Another Session
              </button>
              <Link href="/dashboard" className="block text-center text-[#ff5722] hover:text-[#e64a19] font-semibold text-sm mb-3 transition-colors">
                View My Dashboard
              </Link>
              <Link href="/" className="block text-center text-xs text-gray-500 hover:text-gray-400 transition-colors">
                Return to Homepage
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </main>
  );
}