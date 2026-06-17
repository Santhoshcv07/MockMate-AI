"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Check if the user is already logged in when the page loads
    const checkUser = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      setUser(session?.user || null);
      setIsChecking(false);
    };
    checkUser();

    // 2. Listen for real-time login/logout events across the app
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    // Cleanup listener when component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login"); // Teleport them back to login after signing out
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0f1115]/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold tracking-tight hover:opacity-80 transition-opacity text-white">
          MockMate <span className="text-[#ff5722]">AI</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-4 md:gap-6 items-center font-semibold text-sm text-gray-300">
          {/* Prevent UI flickering while checking Auth status */}
          {!isChecking && (
            user ? (
              /* -------- LOGGED IN NAVBAR -------- */
              <>
                <Link href="/dashboard" className="hover:text-white transition-colors hidden md:block">
                  Dashboard
                </Link>
                <Link
  href="/resume"
  className="hover:text-white transition-colors hidden md:block"
>
  Resume
</Link>
                <Link 
                  href="/interview" 
                  className="hover:text-white transition-colors hidden md:block"
                >
                  New Interview
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-5 py-2.5 rounded-full transition-all shadow-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              /* -------- LOGGED OUT NAVBAR -------- */
              <>
                <Link href="/login" className="hover:text-white transition-colors">
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-[#ff5722] hover:bg-[#e64a19] text-white px-5 py-2.5 rounded-full transition-all shadow-md shadow-[#ff5722]/20"
                >
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
        
      </div>
    </nav>
  );
}