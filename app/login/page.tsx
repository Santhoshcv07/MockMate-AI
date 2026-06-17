"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Ask Supabase to verify the email and password
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If credentials are wrong or user doesn't exist, show error
      setError(error.message);
      setLoading(false);
    } else {
      // If successful, take them straight to their dashboard
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow for premium feel, positioned differently than signup for variety */}
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#ff5722] rounded-full blur-[200px] opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* White Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-gray-300 text-sm">Sign in to MockMate AI to view your performance.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722] transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 text-sm p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#ff5722] hover:bg-[#e64a19] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#ff5722]/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-300 border-t border-white/10 pt-6">
            Don't have an account yet?{" "}
            <Link href="/signup" className="text-[#ff5722] hover:text-[#e64a19] font-semibold transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}