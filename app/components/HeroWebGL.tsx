"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type MouseState = {
  x: number;
  y: number;
};

function AbstractObject() {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const secondaryMesh = useRef<THREE.Mesh>(null);

  const mouse = useRef<MouseState>({ x: 0, y: 0 });
  const targetMouse = useRef<MouseState>({ x: 0, y: 0 });

  const scrollTarget = useRef(0);
  const scroll = useRef(0);

  const reducedMotion = useRef(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      targetMouse.current.x =
        event.clientX / window.innerWidth - 0.5;

      targetMouse.current.y =
        event.clientY / window.innerHeight - 0.5;
    };

    const handleScroll = () => {
      scrollTarget.current = window.scrollY;
    };

    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const handleMotionPreference = () => {
      reducedMotion.current = mediaQuery.matches;
    };

    handleMotionPreference();

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    mediaQuery.addEventListener(
      "change",
      handleMotionPreference
    );

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      mediaQuery.removeEventListener(
        "change",
        handleMotionPreference
      );
    };
  }, []);

  /*
   * Store the original geometry positions so we can
   * continuously deform the surface without destroying
   * the underlying shape.
   */
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.55, 4);

    const position = geo.attributes.position;

    const original = new Float32Array(
      position.array.length
    );

    original.set(position.array);

    geo.userData.originalPositions = original;

    return geo;
  }, []);

  const secondaryGeometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(1.78, 2);
  }, []);

  useFrame((state) => {
    if (!group.current || !mesh.current) return;

    const time = state.clock.getElapsedTime();

    /*
     * Smooth cursor interpolation.
     * This gives the object that delayed,
     * liquid-following feeling.
     */
    mouse.current.x = THREE.MathUtils.lerp(
      mouse.current.x,
      targetMouse.current.x,
      0.035
    );

    mouse.current.y = THREE.MathUtils.lerp(
      mouse.current.y,
      targetMouse.current.y,
      0.035
    );

    scroll.current = THREE.MathUtils.lerp(
      scroll.current,
      scrollTarget.current,
      0.04
    );

    const mx = mouse.current.x;
    const my = mouse.current.y;

    /*
     * Base movement.
     *
     * Reduced motion still leaves the object visible,
     * but removes the continuous animation.
     */
    const motionMultiplier = reducedMotion.current
      ? 0
      : 1;

    /*
     * Slow, organic rotation.
     */
    group.current.rotation.y =
      time * 0.055 * motionMultiplier +
      mx * 0.45;

    group.current.rotation.x =
      Math.sin(time * 0.22) * 0.08 * motionMultiplier +
      my * -0.3;

    group.current.rotation.z =
      Math.cos(time * 0.18) * 0.045 * motionMultiplier;

    /*
     * Scroll subtly rotates the object.
     * The effect is deliberately restrained.
     */
    group.current.rotation.y +=
      scroll.current * 0.00035;

    /*
     * The entire object slowly breathes.
     */
    const breathing =
      1 +
      Math.sin(time * 0.7) *
        0.035 *
        motionMultiplier;

    group.current.scale.set(
      breathing,
      breathing,
      breathing
    );

    /*
     * ORGANIC DEFORMATION
     *
     * Instead of leaving the icosahedron rigid,
     * each vertex gets a subtle noise-like displacement.
     */
    const position = geometry.attributes.position;
    const original =
      geometry.userData.originalPositions as Float32Array;

    for (
      let i = 0;
      i < position.count;
      i++
    ) {
      const index = i * 3;

      const ox = original[index];
      const oy = original[index + 1];
      const oz = original[index + 2];

      const length = Math.sqrt(
        ox * ox + oy * oy + oz * oz
      );

      const nx = ox / length;
      const ny = oy / length;
      const nz = oz / length;

      /*
       * Multiple waves overlap here to create
       * a soft liquid deformation rather than
       * an obvious mathematical wobble.
       */
      const wave1 =
        Math.sin(
          ox * 2.8 +
            time * 0.65
        ) *
        0.035;

      const wave2 =
        Math.sin(
          oy * 3.4 -
            time * 0.5
        ) *
        0.025;

      const wave3 =
        Math.sin(
          oz * 4.1 +
            time * 0.35
        ) *
        0.02;

      /*
       * Cursor proximity pushes the surface.
       *
       * The mouse is translated into a rough 3D
       * direction so the object feels like it's
       * reacting to the pointer.
       */
      const cursorDirection = new THREE.Vector3(
        mx * 1.4,
        -my * 1.4,
        0.8
      ).normalize();

      const dot =
        nx * cursorDirection.x +
        ny * cursorDirection.y +
        nz * cursorDirection.z;

      const cursorInfluence = Math.max(
        0,
        dot
      );

      const cursorDeformation =
        cursorInfluence *
        cursorInfluence *
        0.13;

      const displacement =
        wave1 +
        wave2 +
        wave3 +
        cursorDeformation;

      position.setXYZ(
        i,
        ox + nx * displacement,
        oy + ny * displacement,
        oz + nz * displacement
      );
    }

    position.needsUpdate = true;

    /*
     * Slight secondary orbit.
     */
    if (secondaryMesh.current) {
      secondaryMesh.current.rotation.x =
        -time * 0.09 * motionMultiplier;

      secondaryMesh.current.rotation.y =
        time * 0.07 * motionMultiplier;

      secondaryMesh.current.rotation.z =
        mx * 0.2;

      const secondaryScale =
        1 +
        Math.sin(time * 0.45) *
          0.025 *
          motionMultiplier;

      secondaryMesh.current.scale.setScalar(
        secondaryScale
      );
    }
  });

  return (
    <group
      ref={group}
      position={[0, 0, 0]}
    >
      {/* Main living object */}
      <mesh
        ref={mesh}
        geometry={geometry}
        scale={1.05}
      >
        <meshBasicMaterial
          color="#dce8e0"
          transparent
          opacity={0.17}
          wireframe
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Larger, quieter orbital structure */}
      <mesh
        ref={secondaryMesh}
        geometry={secondaryGeometry}
      >
        <meshBasicMaterial
          color="#aabdb2"
          transparent
          opacity={0.055}
          wireframe
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Small internal glow */}
      <mesh scale={0.82}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#dce8e0"
          transparent
          opacity={0.018}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  return <AbstractObject />;
}

export default function HeroWebGL() {
  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        z-0
        overflow-hidden
      "
      aria-hidden="true"
    >
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
      >
        <Scene />
      </Canvas>

      {/* Atmospheric bloom around the object */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[34rem]
          w-[34rem]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[110px]
        "
        style={{
          background:
            "radial-gradient(circle, rgba(180,205,190,0.075) 0%, rgba(120,150,135,0.025) 35%, transparent 70%)",
        }}
      />

      {/* Very subtle centre glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-32
          w-32
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[50px]
        "
        style={{
          background:
            "radial-gradient(circle, rgba(220,235,225,0.12), transparent 70%)",
        }}
      />
    </div>
  );
}