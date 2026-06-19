"use client";

export default function AIBackground() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <img src="/images/ai-bg.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FF6B35] rounded-full blur-[150px] opacity-[0.05] pointer-events-none z-0" />
    </>
  );
}