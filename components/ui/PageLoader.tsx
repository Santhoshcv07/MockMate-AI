"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageLoaderProps {
  isVisible?: boolean;
  message?: string;
}

export default function PageLoader({ 
  isVisible = true, 
  message = "Loading" 
}: PageLoaderProps) {
  const [dots, setDots] = useState("");

  // Animated dots logic (cycles: ".", "..", "...")
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(250,250,250,0.95)] backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center"
          >
            {/* --- LOGO & RING CONTAINER --- */}
            <div className="relative flex items-center justify-center w-24 h-24 mb-8">
              
              {/* OUTER ORANGE RING (Infinite smooth rotation) */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[3px] border-gray-100 border-t-[#FF6B35] shadow-sm"
              />
              
              {/* INNER FLOATING LOGO */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-[0_8px_20px_rgba(255,107,53,0.3)] z-10"
              >
                <span className="font-black text-white text-2xl">M</span>
              </motion.div>

            </div>

            {/* --- ANIMATED TEXT --- */}
            {/* The wrapper prevents the whole string from jumping left/right as dots are added */}
            <div className="flex items-center justify-center min-w-[200px]">
              <h2 className="text-[#111111] font-bold text-lg tracking-tight flex items-center">
                {message}
                <span className="inline-block w-6 text-left">{dots}</span>
              </h2>
            </div>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}