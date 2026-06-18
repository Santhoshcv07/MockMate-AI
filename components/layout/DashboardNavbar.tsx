"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabase-client";

const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Resume", href: "/resume" },
  { name: "New Interview", href: "/interview" },
];

export default function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user?.email) setUserEmail(session.user.email);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login");
  };

  const getInitials = (email: string) => email ? email.charAt(0).toUpperCase() : "U";

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LEFT: LOGO */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
              <span className="font-black text-white text-xl">M</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-[#111111] hidden sm:block">
              MockMate <span className="text-[#666666] font-medium">AI</span>
            </span>
          </Link>
        </div>

        {/* CENTER: DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center justify-center gap-2 flex-1 px-8 h-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`relative px-5 py-2 h-full flex items-center text-sm font-bold transition-colors ${
                  isActive ? "text-[#111111]" : "text-[#666666] hover:text-[#111111]"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF6B35] rounded-t-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* RIGHT: USER AVATAR & SIGN OUT */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-[#111111] font-bold text-sm shadow-sm">
              {userEmail ? getInitials(userEmail) : "..."}
            </div>
            <button onClick={handleSignOut} className="text-sm font-bold text-[#666666] hover:text-[#EF4444] transition-colors">
              Sign Out
            </button>
          </div>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="md:hidden flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-[#111111] font-bold text-sm shadow-sm">
            {userEmail ? getInitials(userEmail) : "..."}
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#111111] p-2 -mr-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl overflow-hidden shadow-xl"
          >
            <div className="flex flex-col px-6 py-4 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link 
                    key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${isActive ? "bg-[#FF6B35]/10 text-[#FF6B35]" : "text-[#666666] hover:bg-gray-50 hover:text-[#111111]"}`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="border-t border-gray-100 my-2 pt-2">
                <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-[#EF4444] hover:bg-red-50 transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}