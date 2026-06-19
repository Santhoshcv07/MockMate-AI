import type { Metadata } from "next";
import "./globals.css";

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
      <body className="bg-[#FAFAFA] text-[#111111] antialiased">
        {/* Render pages directly. Navbars are now handled per-page. */}
        {children}
      </body>
    </html>
  );
}