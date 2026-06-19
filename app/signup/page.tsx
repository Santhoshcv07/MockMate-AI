"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";

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
    <main className="relative min-h-screen flex items-center justify-center bg-[#FAFAFA] text-[#111111] overflow-hidden font-sans">
      
      {/* --- BACKGROUND GLOWS, GRIDS, & IMAGE LAYER --- */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <img src="/images/ai-bg.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF6B35] rounded-full blur-[200px] opacity-[0.05] pointer-events-none z-0" />
      
      {/* --- CONTENT CONTAINER --- */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-0 min-h-screen flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 relative z-10">
        
        {/* --- LEFT SIDE: BRANDING & STATS (ORDER 2 ON MOBILE, 1 ON DESKTOP) --- */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="order-2 lg:order-1 w-full lg:w-1/2 flex flex-col justify-center"
        >
          <div className="mb-12 hidden lg:block">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-[0_4px_15px_rgba(255,107,53,0.3)] group-hover:scale-105 transition-transform duration-300">
                <span className="font-black text-white text-2xl">M</span>
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#111111]">MockMate <span className="text-[#666666] font-medium">AI</span></span>
            </Link>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-4 text-[#111111]">
            Start Your Journey
          </h1>
          
          <p className="text-lg text-[#666666] max-w-md leading-relaxed font-medium mb-10">
            Join thousands of ambitious candidates preparing with MockMate AI.
          </p>

          <div className="space-y-4 mb-12">
            {["Resume-Aware Interviews", "AI Voice Conversations", "Recruiter-Grade Analytics"].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-[#111111] font-bold text-lg">
                <div className="w-7 h-7 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 lg:gap-6 border-t border-gray-200 pt-8">
            <div>
              <div className="text-2xl lg:text-3xl font-black text-[#111111] flex items-center tracking-tight">
                <AnimatedNumber value={10} />,<AnimatedNumber value={0} />+
              </div>
              <div className="text-[#666666] text-[10px] lg:text-xs font-bold uppercase tracking-widest mt-1">Interviews</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-[#111111] flex items-center tracking-tight">
                <AnimatedNumber value={95} />%
              </div>
              <div className="text-[#666666] text-[10px] lg:text-xs font-bold uppercase tracking-widest mt-1">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-[#111111] tracking-tight">24/7</div>
              <div className="text-[#666666] text-[10px] lg:text-xs font-bold uppercase tracking-widest mt-1">Availability</div>
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT SIDE: SIGNUP CARD (ORDER 1 ON MOBILE, 2 ON DESKTOP) --- */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="order-1 lg:order-2 w-full lg:w-1/2 flex flex-col items-center justify-center"
        >
          {/* Mobile Logo Fallback */}
          <div className="lg:hidden w-full flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-sm">
                <span className="font-black text-white text-2xl">M</span>
              </div>
              <span className="font-bold text-2xl tracking-tight text-[#111111]">MockMate</span>
            </Link>
          </div>

          <div className="w-full max-w-[440px] bg-white/75 backdrop-blur-xl border border-white/50 p-8 sm:p-12 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative z-10">
            
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#111111] mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="w-full h-[56px] px-5 bg-white border border-gray-200 rounded-[16px] text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] focus:shadow-[0_0_15px_rgba(255,107,53,0.2)] transition-all duration-300 font-medium shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#111111] mb-2">Create Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-[56px] px-5 pr-12 bg-white border border-gray-200 rounded-[16px] text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] focus:shadow-[0_0_15px_rgba(255,107,53,0.2)] transition-all duration-300 font-medium shadow-sm"
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
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-[16px] text-red-600 text-sm font-bold text-center shadow-sm">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-[16px] text-emerald-600 text-sm font-bold text-center shadow-sm">
                  {successMsg}
                </div>
              )}

              <div className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.03 }} 
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full h-[56px] rounded-[16px] bg-[#111111] hover:bg-gray-800 text-white font-black text-lg flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </div>
            </form>

            <p className="text-center text-[#666666] font-medium text-sm mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-[#111111] font-bold hover:text-[#FF6B35] transition-colors underline underline-offset-4 decoration-2 decoration-gray-200 hover:decoration-[#FF6B35]">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>

      </div>
    </main>
  );
}