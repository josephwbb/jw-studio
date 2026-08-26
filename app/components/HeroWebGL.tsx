"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* =========================================================
   PARTICLES
========================================================= */

function Particles() {
  const points = useRef<THREE.Points>(null);

  const particleCount = 85;

  const positions = useMemo(() => {
    const array = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      array[i * 3] = (Math.random() - 0.5) * 8;
      array[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
      array[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }

    return array;
  }, []);

  useFrame((state, delta) => {
    if (!points.current) return;

    points.current.rotation.y += delta * 0.004;
    points.current.rotation.x += delta * 0.0015;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.014}
        color="#dce8e0"
        transparent
        opacity={0.28}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* =========================================================
   ENERGY CORE
========================================================= */

function EnergyCore() {
  const core = useRef<THREE.Mesh>(null);
  const innerGlow = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (core.current) {
      const pulse =
        0.105 + Math.sin(time * 1.8) * 0.006;

      core.current.scale.setScalar(pulse);
    }

    if (innerGlow.current) {
      const pulse =
        0.28 + Math.sin(time * 1.25) * 0.018;

      innerGlow.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      <mesh ref={innerGlow}>
        <sphereGeometry args={[1, 16, 16]} />

        <meshBasicMaterial
          color="#eaf5ee"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={core}>
        <sphereGeometry args={[1, 12, 12]} />

        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* =========================================================
   PLANET
========================================================= */

function Planet() {
  const group = useRef<THREE.Group>(null);

  const orbit1 = useRef<THREE.Mesh>(null);
  const orbit2 = useRef<THREE.Mesh>(null);
  const orbit3 = useRef<THREE.Mesh>(null);

  const planetGeometry = useMemo(() => {
    return new THREE.SphereGeometry(
      1.7,
      48,
      32
    );
  }, []);

  const atmosphereGeometry = useMemo(() => {
    return new THREE.SphereGeometry(
      1.7,
      32,
      24
    );
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;
    const pointer = state.pointer;

    /* ---------------------------------------------
       Mouse movement
    --------------------------------------------- */

    const targetX =
      pointer.y * 0.12 +
      Math.sin(time * 0.18) * 0.025;

    const targetY =
      pointer.x * 0.17 +
      Math.sin(time * 0.14) * 0.06;

    group.current.rotation.x =
      THREE.MathUtils.damp(
        group.current.rotation.x,
        targetX,
        3.5,
        delta
      );

    group.current.rotation.y =
      THREE.MathUtils.damp(
        group.current.rotation.y,
        targetY,
        3.5,
        delta
      );

    /* ---------------------------------------------
       Floating
    --------------------------------------------- */

    group.current.position.y =
      Math.sin(time * 0.45) * 0.04;

    /* ---------------------------------------------
       Orbit movement
    --------------------------------------------- */

    if (orbit1.current) {
      orbit1.current.rotation.z +=
        delta * 0.035;
    }

    if (orbit2.current) {
      orbit2.current.rotation.x +=
        delta * 0.022;
    }

    if (orbit3.current) {
      orbit3.current.rotation.y -=
        delta * 0.014;
    }
  });

  return (
    <group ref={group}>

      {/* =================================================
          MAIN PLANET
      ================================================= */}

      <mesh geometry={planetGeometry}>
        <meshStandardMaterial
          color="#c7d6cd"
          roughness={0.24}
          metalness={0.03}
        />
      </mesh>

      {/* =================================================
          SOFT ATMOSPHERE

          BackSide makes this behave like a thin shell
          around the planet rather than a white disc.
      ================================================= */}

      <mesh
        geometry={atmosphereGeometry}
        scale={1.025}
      >
        <meshBasicMaterial
          color="#e7f2eb"
          transparent
          opacity={0.055}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* =================================================
          INNER SPHERE

          Gives the centre more visual depth.
      ================================================= */}

      <mesh scale={0.72}>
        <sphereGeometry
          args={[1.7, 24, 18]}
        />

        <meshStandardMaterial
          color="#eef5f0"
          roughness={0.16}
          metalness={0}
          transparent
          opacity={0.13}
          depthWrite={false}
        />
      </mesh>

      {/* =================================================
          ENERGY CORE
      ================================================= */}

      <EnergyCore />

      {/* =================================================
          ORBIT 1
      ================================================= */}

      <mesh
        ref={orbit1}
        rotation={[
          Math.PI / 2.8,
          0.3,
          0
        ]}
      >
        <torusGeometry
          args={[
            2.12,
            0.006,
            6,
            72
          ]}
        />

        <meshBasicMaterial
          color="#edf5ef"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* =================================================
          ORBIT 2
      ================================================= */}

      <mesh
        ref={orbit2}
        rotation={[
          1.1,
          0.8,
          0.4
        ]}
      >
        <torusGeometry
          args={[
            2.38,
            0.004,
            6,
            72
          ]}
        />

        <meshBasicMaterial
          color="#e4efe8"
          transparent
          opacity={0.11}
          depthWrite={false}
        />
      </mesh>

      {/* =================================================
          ORBIT 3
      ================================================= */}

      <mesh
        ref={orbit3}
        rotation={[
          0.45,
          -0.7,
          1.2
        ]}
      >
        <torusGeometry
          args={[
            2.62,
            0.0025,
            6,
            64
          ]}
        />

        <meshBasicMaterial
          color="#dce9e1"
          transparent
          opacity={0.065}
          depthWrite={false}
        />
      </mesh>

      {/* =================================================
          ORBITING OBJECT
      ================================================= */}

      <mesh position={[2.12, 0, 0]}>
        <sphereGeometry
          args={[0.035, 10, 10]}
        />

        <meshBasicMaterial
          color="#ffffff"
        />
      </mesh>

      {/* =================================================
          SECOND ORBITING OBJECT
      ================================================= */}

      <mesh position={[-1.65, 0.45, 0]}>
        <sphereGeometry
          args={[0.018, 8, 8]}
        />

        <meshBasicMaterial
          color="#eaf4ee"
          transparent
          opacity={0.8}
        />
      </mesh>

    </group>
  );
}

/* =========================================================
   SCENE
========================================================= */

function Scene() {
  return (
    <>
      {/* Ambient fill */}

      <ambientLight
        intensity={0.12}
      />

      {/* Main directional light */}

      <directionalLight
        position={[4, 4, 5]}
        intensity={2.4}
      />

      {/* Cool side light */}

      <pointLight
        position={[-4, -1, 4]}
        intensity={1.1}
        distance={9}
      />

      {/* Very subtle rear light */}

      <pointLight
        position={[3, 2, -4]}
        intensity={0.45}
        distance={8}
      />

      <Particles />

      <Planet />
    </>
  );
}

/* =========================================================
   HERO WEBGL
========================================================= */

export default function HeroWebGL() {
  const [ready, setReady] =
    useState(false);

  return (
    <div
      className={`
        absolute
        inset-0
        z-[5]
        pointer-events-none
        transition-opacity
        duration-[1000ms]
        ${
          ready
            ? "opacity-100"
            : "opacity-0"
        }
      `}
    >
      <Canvas
        camera={{
          position: [0, 0, 6],
          fov: 42
        }}

        onCreated={() => {
          setTimeout(() => {
            setReady(true);
          }, 200);
        }}

        dpr={1}

        gl={{
          antialias: true,
          alpha: true,
          powerPreference:
            "high-performance",
          stencil: false,
          depth: true
        }}

        frameloop="always"
      >
        <Scene />
      </Canvas>
    </div>
  );
}