"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function AbstractObject() {
  const mesh = useRef<THREE.Mesh>(null);

  return (
    <mesh
      ref={mesh}
      rotation={[0.25, 0.35, 0.15]}
      scale={1.15}
    >
      <icosahedronGeometry args={[1.25, 2]} />

      <meshBasicMaterial
        color="#dce8e0"
        transparent
        opacity={0.18}
        wireframe
        depthWrite={false}
      />
    </mesh>
  );
}

function Scene() {
  return <AbstractObject />;
}

export default function HeroWebGL() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
        }}
        dpr={1}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
          stencil: false,
          depth: false,
        }}
        frameloop="demand"
      >
        <Scene />
      </Canvas>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
        style={{
          background:
            "radial-gradient(circle, rgba(220,235,225,0.08), transparent 70%)",
        }}
      />
    </div>
  );
}