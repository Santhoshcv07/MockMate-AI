"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Environment } from "@react-three/drei";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

function RobotModel() {
  const robot = useGLTF("/models/ai_robot.glb");
  const ref = useRef<any>(null);

  useFrame(() => {
    if (!ref.current) return;
    // Slow continuous rotation (very subtle, as requested)
    ref.current.rotation.y += 0.009;
  });

  return (
    <Center>
      <primitive ref={ref} object={robot.scene} scale={3.5} />
    </Center>
  );
}

export default function HeroRobot() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth interpolation for parallax
  const springConfig = { damping: 25, stiffness: 60 };
  const parallaxX = useSpring(useTransform(mouseX, [-1, 1], [-15, 15]), springConfig);
  const parallaxY = useSpring(useTransform(mouseY, [-1, 1], [-15, 15]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to range [-1, 1]
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="w-full h-[590px] relative flex items-center justify-center">
      
      {/* Glow Effect behind the robot */}
      <motion.div
        animate={{ opacity: [0.1, 0.15, 0.1], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#FF6B35] rounded-full pointer-events-none z-0"
        style={{ filter: "blur(120px)" }}
      />

      {/* Parallax Wrapper */}
      <motion.div style={{ x: parallaxX, y: parallaxY }} className="absolute inset-0 z-10">
        
        {/* Floating Wrapper (0 -> -15px -> 0 over 4s) */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full"
        >
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }} className="cursor-grab active:cursor-grabbing">
            
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} />
            
            {/* Premium Orange Lighting Accents */}
            <pointLight position={[-5, 2, 5]} intensity={4} color="#FF6B35" />
            <pointLight position={[5, -5, 2]} intensity={3} color="#FF8C42" />

            <Suspense fallback={null}>
              <RobotModel />
              <Environment preset="city" />
            </Suspense>

            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        </motion.div>
      </motion.div>
    </div>
  );
}