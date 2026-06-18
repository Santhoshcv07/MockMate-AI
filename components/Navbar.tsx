"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-[0_4px_10px_rgba(255,107,53,0.3)]">
            <span className="font-black text-white text-xl">M</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-[#111111]">MockMate <span className="text-[#666666]">AI</span></span>
        </Link>

        {/* Center: Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#666666]">
          <Link href="/#features" className="hover:text-[#111111] transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-[#111111] transition-colors">How It Works</Link>
          <Link href="/#dashboard" className="hover:text-[#111111] transition-colors">Analytics</Link>
          <Link href="/#faq" className="hover:text-[#111111] transition-colors">FAQ</Link>
        </div>

        {/* Right: CTA Actions */}
        <div className="flex items-center gap-5">
          <Link href="/login" className="text-sm font-bold text-[#666666] hover:text-[#111111] transition-colors hidden sm:block">
            Log in
          </Link>
          <Link href="/signup" className="text-sm font-bold bg-[#111111] text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg">
            Sign Up Free
          </Link>
        </div>

      </div>
    </nav>
  );
}