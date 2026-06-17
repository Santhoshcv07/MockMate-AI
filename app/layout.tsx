import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
        
        {/* Inject our new intelligent client component here */}
        <Navbar />

        {/* Main Page Content */}
        {/* We use pt-20 (padding-top) so the content doesn't hide behind our fixed 20-height navbar */}
        <div className="pt-20">
          {children}
        </div>

      </body>
    </html>
  );
}