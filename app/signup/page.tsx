"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// --- ANIMATED COUNTER COMPONENT ---
const AnimatedNumber = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  
  useEffect(() => {
    const animation = animate(count, value, { duration: 2, ease: "easeOut" });
    return animation.stop;
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
};

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      if (data?.session) {
        router.push("/dashboard");
      } else {
        setSuccessMsg("Account created! Please check your email to verify.");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col md:flex-row bg-white text-[#111111] selection:bg-[#FF6B35]/20 selection:text-[#111111] overflow-hidden font-sans">
      
     
      
      {/* --- UNIFIED NAVBAR --- */}
      <Navbar />

      {/* --- LEFT SIDE: BRANDING & STATS (HIDDEN ON MOBILE) --- */}
      <div className="hidden md:flex flex-col justify-center px-12 lg:px-24 w-1/2 relative z-10 border-r border-gray-100 bg-white/40 backdrop-blur-sm pt-20">
        
        <div className="relative z-10 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-[0_4px_15px_rgba(255,107,53,0.3)]">
              <span className="font-black text-white text-3xl">M</span>
            </div>
            <span className="font-bold text-3xl tracking-tight text-[#111111]">MockMate <span className="text-[#666666] font-medium">AI</span></span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-6 text-[#111111]"
          >
            Ace Every <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8C42]">Interview With AI</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#666666] max-w-md leading-relaxed font-medium mb-12"
          >
            Resume-aware interviews, real-time voice conversations, and recruiter-grade analytics.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-5"
          >
            {["Resume Analysis", "AI Voice Interviews", "Performance Analytics"].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-[#111111] font-bold text-lg">
                <div className="w-7 h-7 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                {feature}
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-3 gap-6 relative z-10 border-t border-gray-200 pt-8 mt-auto mb-10"
        >
          <div>
            <div className="text-3xl font-black text-[#111111] flex items-center tracking-tight">
              <AnimatedNumber value={10} />,<AnimatedNumber value={0} /> <AnimatedNumber value={0} /> <AnimatedNumber value={0} />+
            </div>
            <div className="text-[#666666] text-xs font-bold uppercase tracking-widest mt-1">Interviews</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#111111] flex items-center tracking-tight">
              <AnimatedNumber value={95} />%
            </div>
            <div className="text-[#666666] text-xs font-bold uppercase tracking-widest mt-1">Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#111111] tracking-tight">24/7</div>
            <div className="text-[#666666] text-xs font-bold uppercase tracking-widest mt-1">Availability</div>
          </div>
        </motion.div>
      </div>

      {/* --- RIGHT SIDE: SIGNUP FORM --- */}
      <div className="flex flex-col justify-center items-center p-6 w-full md:w-1/2 relative z-10 min-h-screen md:min-h-0 pt-28 md:pt-20">

        {/* Form specific ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#FF6B35] rounded-full blur-[150px] opacity-[0.07] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[420px] bg-white/65 backdrop-blur-[20px] border border-white/80 p-8 sm:p-10 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative z-10"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2 text-[#111111] tracking-tight">Create Account</h2>
            <p className="text-[#666666] font-medium">Start practicing with AI-powered interviews today.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <label className="block text-sm font-bold text-[#111111] mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full h-[56px] pl-11 pr-4 bg-white/80 border border-gray-200 rounded-[16px] text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] focus:bg-white focus:shadow-[0_0_15px_rgba(255,107,53,0.2)] transition-all duration-300"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <label className="block text-sm font-bold text-[#111111] mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password" 
                  className="w-full h-[56px] pl-11 pr-12 bg-white/80 border border-gray-200 rounded-[16px] text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] focus:bg-white focus:shadow-[0_0_15px_rgba(255,107,53,0.2)] transition-all duration-300"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#FF6B35] transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </motion.div>

            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold text-center">
                {errorMsg}
              </motion.div>
            )}

            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm font-semibold text-center">
                {successMsg}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-2">
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ["0 0 0px rgba(255,107,53,0.2)", "0 0 15px rgba(255,107,53,0.4)", "0 0 0px rgba(255,107,53,0.2)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                disabled={loading}
                className="w-full h-[56px] rounded-[16px] bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white font-black text-lg flex items-center justify-center shadow-[0_10px_20px_rgba(255,107,53,0.25)] hover:shadow-[0_15px_30px_rgba(255,107,53,0.35)] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center text-[#666666] font-medium text-sm mt-8 pt-6 border-t border-gray-200">
            Already have an account?{" "}
            <Link href="/login" className="text-[#111111] font-bold hover:text-[#FF6B35] transition-colors">Sign in</Link>
          </motion.p>
        </motion.div>
      </div>

    </main>
  );
}