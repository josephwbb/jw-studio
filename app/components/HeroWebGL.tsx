"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type PointerState = {
  x: number;
  y: number;
};

function HeroSculpture() {
  const group = useRef<THREE.Group>(null);
  const coreMesh = useRef<THREE.Mesh>(null);
  const wireMesh = useRef<THREE.Mesh>(null);
  const innerRing = useRef<THREE.Mesh>(null);
  const outerRing = useRef<THREE.Mesh>(null);

  const pointer = useRef<PointerState>({ x: 0, y: 0 });
  const targetPointer = useRef<PointerState>({ x: 0, y: 0 });
  const viewport = useThree((state) => state.viewport);

  // Low-poly geometries for maximum performance & sharp geometric aesthetic
  const coreGeo = useMemo(() => new THREE.IcosahedronGeometry(1.25, 1), []);
  const wireGeo = useMemo(() => new THREE.IcosahedronGeometry(1.27, 1), []);
  const ring1Geo = useMemo(() => new THREE.TorusGeometry(1.9, 0.003, 8, 80), []);
  const ring2Geo = useMemo(() => new THREE.TorusGeometry(2.35, 0.002, 8, 100), []);

  const responsiveScale = viewport.width < 5 ? 0.6 : viewport.width < 7 ? 0.8 : 1.0;

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      targetPointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      targetPointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.getElapsedTime();

    // Smooth cursor tracking (lerp)
    pointer.current.x = THREE.MathUtils.lerp(pointer.current.x, targetPointer.current.x, 0.04);
    pointer.current.y = THREE.MathUtils.lerp(pointer.current.y, targetPointer.current.y, 0.04);

    const px = pointer.current.x;
    const py = pointer.current.y;

    // Fluid float & subtle cursor tilt
    group.current.position.x = Math.sin(time * 0.4) * 0.04 + px * 0.15;
    group.current.position.y = Math.cos(time * 0.3) * 0.05 - py * 0.12;

    group.current.rotation.y = time * 0.06 + px * 0.2;
    group.current.rotation.x = Math.sin(time * 0.2) * 0.04 - py * 0.15;

    // Counter-rotating geometric layers
    if (coreMesh.current) {
      coreMesh.current.rotation.y = time * 0.08;
      coreMesh.current.rotation.z = time * 0.04;
    }

    if (wireMesh.current) {
      wireMesh.current.rotation.y = -time * 0.1;
      wireMesh.current.rotation.x = time * 0.05;
    }

    if (innerRing.current) {
      innerRing.current.rotation.x = Math.PI * 0.4 + Math.sin(time * 0.3) * 0.08;
      innerRing.current.rotation.y = time * 0.12;
    }

    if (outerRing.current) {
      outerRing.current.rotation.x = -Math.PI * 0.35 + Math.cos(time * 0.25) * 0.06;
      outerRing.current.rotation.z = -time * 0.08;
    }
  });

  return (
    <group ref={group} scale={responsiveScale}>
      {/* Matte Obsidian Inner Core */}
      <mesh ref={coreMesh} geometry={coreGeo}>
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.2}
          metalness={0.8}
          flatShading
        />
      </mesh>

      {/* Sharp Subtle Outer Wireframe Overlay */}
      <mesh ref={wireMesh} geometry={wireGeo}>
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Minimal Inner Orbit Ring */}
      <mesh ref={innerRing} geometry={ring1Geo}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Minimal Outer Orbit Ring */}
      <mesh ref={outerRing} geometry={ring2Geo}>
        <meshBasicMaterial
          color="#888888"
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}

export default function HeroWebGL() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, -5, -2]} intensity={0.5} color="#444444" />
        
        <HeroSculpture />
      </Canvas>

      {/* Subtle Central Glow Vignette */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[24rem]
          w-[24rem]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[100px]
          opacity-30
        "
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0) 70%)",
        }}
      />
    </div>
  );
}