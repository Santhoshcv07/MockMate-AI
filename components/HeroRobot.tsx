"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useRef } from "react";
import { Center } from "@react-three/drei";
function RobotModel() {
  const robot = useGLTF("/models/ai_robot.glb");
  const ref = useRef<any>(null);

useFrame((state) => {
  if (!ref.current) return;

  // Slow continuous rotation
ref.current.rotation.y += 0.007;

  // Floating animation
ref.current.position.y =
  -1.5 + Math.sin(state.clock.elapsedTime * 1.2) * 0.25;
});

  return (
  <Center>
  <primitive
    ref={ref}
    object={robot.scene}
    scale={4}
  />
</Center>
  );
}

export default function HeroRobot() {
  return (
    <div className="w-full h-[550px]">
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[5, 5, 5]} intensity={2} />

        <RobotModel />

     
      </Canvas>
    </div>
  );
}