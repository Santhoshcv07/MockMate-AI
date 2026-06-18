import DashboardNavbar from "@/components/layout/DashboardNavbar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#FAFAFA] text-[#111111] selection:bg-[#FF6B35]/20 selection:text-[#111111] font-sans overflow-x-hidden">
      
      {/* --- SHARED BACKGROUND (Matches Landing Page exactly) --- */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <img src="/images/ai-bg.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FF6B35] rounded-full blur-[150px] opacity-[0.05] pointer-events-none z-0" />

      {/* --- PERSISTENT NAVBAR --- */}
      <DashboardNavbar />

      {/* --- PAGE CONTENT WRAPPER --- */}
      <div className="pt-24 pb-16 px-6 relative z-10 max-w-7xl mx-auto w-full">
        {children}
      </div>
      
    </div>
  );
}