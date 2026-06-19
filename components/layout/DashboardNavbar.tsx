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
    <nav className="fixed top-0 w-full z-50 h-[72px] bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* LEFT: LOGO */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="font-black text-white text-lg">M</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-[#111111] hidden sm:block">
              MockMate <span className="text-[#666666] font-medium">AI</span>
            </span>
          </Link>
        </div>

        {/* CENTER: DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center justify-center gap-6 flex-1 h-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(`${link.href}/`) && link.href !== '/');
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`relative h-full flex items-center text-sm transition-colors duration-200 ${
                  isActive ? "text-[#111111] font-semibold" : "text-gray-600 font-medium hover:text-[#111111]"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div 
                    layoutId="navbar-active-tab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF6B35] rounded-t-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* RIGHT: USER AVATAR & SIGN OUT */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={handleSignOut} 
            className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#111111] font-bold text-sm shadow-sm">
            {userEmail ? getInitials(userEmail) : "..."}
          </div>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="md:hidden flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#111111] font-bold text-xs shadow-sm">
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
            className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl overflow-hidden shadow-xl absolute w-full"
          >
            <div className="flex flex-col px-6 py-4 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (pathname.startsWith(`${link.href}/`) && link.href !== '/');
                return (
                  <Link 
                    key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? "bg-orange-50 text-[#FF6B35]" : "text-gray-600 hover:bg-gray-50 hover:text-[#111111]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="border-t border-gray-100 my-2 pt-2">
                <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
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