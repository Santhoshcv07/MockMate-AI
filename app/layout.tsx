import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MockMate AI | AI Interview Prep",
  description: "Practice technical and HR interviews with an advanced AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0f1115] text-white antialiased">
        
        {/* Global Fixed Navigation Bar */}
        <nav className="fixed top-0 w-full z-50 bg-[#0f1115]/80 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="text-2xl font-extrabold tracking-tight hover:opacity-80 transition-opacity">
              MockMate <span className="text-[#ff5722]">AI</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex gap-6 items-center font-semibold text-sm text-gray-300">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link 
                href="/interview" 
                className="bg-[#ff5722] hover:bg-[#e64a19] text-white px-5 py-2.5 rounded-full transition-all shadow-md shadow-[#ff5722]/20"
              >
                New Interview
              </Link>
            </div>
            
          </div>
        </nav>

        {/* Main Page Content */}
        {/* We add pt-20 (padding-top) so the content doesn't hide behind our fixed 20-height navbar */}
        <div className="pt-20">
          {children}
        </div>

      </body>
    </html>
  );
}