"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Environment } from "@react-three/drei";

function RobotModel() {
  const robot = useGLTF("/models/ai_robot.glb");
  const ref = useRef<any>(null);

  useFrame((state) => {
    if (!ref.current) return;

    // Slow continuous rotation
    ref.current.rotation.y += 0.008;

    // Floating animation
    ref.current.position.y =
      -1.5 + Math.sin(state.clock.elapsedTime * 1.2) * 0.25;
  });

  return (
    <Center>
      <primitive
        ref={ref}
        object={robot.scene}
        scale={3.5}
      />
    </Center>
  );
}

export default function HeroRobot() {
  return (
    <div className="w-full h-[590px] relative flex items-center justify-center">
      {/* 1. HTML-Based Background Glow behind the canvas */}
      <div className="absolute w-[300px] h-[300px] bg-[#FF6B35] rounded-full blur-[100px] opacity-20 pointer-events-none z-0" />

      <Canvas camera={{ position: [0, 0, 10], fov: 50 }} className="relative z-10 cursor-grab active:cursor-grabbing">
        
        {/* 2. Base 3D Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        
        {/* 3. Brand Orange Glow Lighting applied directly to the 3D model */}
        <pointLight position={[-5, 2, 5]} intensity={4} color="#FF6B35" />
        <pointLight position={[5, -5, 2]} intensity={3} color="#FF8C42" />

        <Suspense fallback={null}>
          <RobotModel />
          {/* Environment adds realistic lighting reflections to metallic/shiny surfaces */}
          <Environment preset="city" />
        </Suspense>

        {/* 4. Allow smooth interaction without breaking page scroll */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}