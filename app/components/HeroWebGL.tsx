"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type PointerState = {
  x: number;
  y: number;
};

function HeroObject() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  const pointer = useRef<PointerState>({ x: 0, y: 0 });
  const targetPointer = useRef<PointerState>({ x: 0, y: 0 });

  const intro = useRef(0);
  const reducedMotion = useRef(false);

  const viewport = useThree((state) => state.viewport);

  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const cursorDirection = useMemo(() => new THREE.Vector3(), []);

  /*
   * The main object is deliberately less dense than the previous
   * version. The shape should read as a piece of digital sculpture,
   * not a giant technical diagram.
   */
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.35, 3);

    const position = geo.attributes.position;
    const original = new Float32Array(position.array.length);
    original.set(position.array);

    geo.userData.originalPositions = original;

    return geo;
  }, []);

  const shellGeometry = useMemo(
    () => new THREE.IcosahedronGeometry(1.58, 2),
    []
  );

  const ringGeometry = useMemo(
    () => new THREE.TorusGeometry(1.62, 0.006, 8, 96),
    []
  );

  const isMobile = viewport.width < 5;

  const responsiveScale = isMobile
    ? 0.58
    : viewport.width < 7
      ? 0.76
      : 0.9;

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    reducedMotion.current = mediaQuery.matches;

    const handleMotion = () => {
      reducedMotion.current = mediaQuery.matches;
    };

    mediaQuery.addEventListener("change", handleMotion);

    return () => {
      mediaQuery.removeEventListener("change", handleMotion);
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      targetPointer.current.x =
        event.clientX / window.innerWidth - 0.5;

      targetPointer.current.y =
        event.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current || !core.current) return;

    const time = state.clock.getElapsedTime();
    const motion = reducedMotion.current ? 0 : 1;

    /*
     * Quick initial assembly.
     *
     * The object begins almost collapsed and expands into place.
     * This is intentionally short so it feels like a design
     * transition rather than a loading animation.
     */
    intro.current = THREE.MathUtils.damp(
      intro.current,
      1,
      3.8,
      delta
    );

    const introEase = THREE.MathUtils.smoothstep(
      intro.current,
      0,
      1
    );

    pointer.current.x = THREE.MathUtils.lerp(
      pointer.current.x,
      targetPointer.current.x,
      0.055
    );

    pointer.current.y = THREE.MathUtils.lerp(
      pointer.current.y,
      targetPointer.current.y,
      0.055
    );

    const mx = pointer.current.x;
    const my = pointer.current.y;

    /*
     * The object slowly floats, but the movement is intentionally
     * restrained. It should support the typography rather than
     * becoming the entire website.
     */
    const floatX =
      Math.sin(time * 0.32) * 0.055 * motion;

    const floatY =
      Math.cos(time * 0.27) * 0.075 * motion;

    const cursorX =
      mx * 0.12 * motion;

    const cursorY =
      -my * 0.08 * motion;

    targetPosition.set(
      floatX + cursorX,
      floatY + cursorY,
      0
    );

    group.current.position.lerp(
      targetPosition,
      0.035
    );

    /*
     * Subtle physical rotation.
     */
    group.current.rotation.y =
      time * 0.095 * motion +
      mx * 0.3;

    group.current.rotation.x =
      Math.sin(time * 0.22) *
        0.055 *
        motion -
      my * 0.18;

    group.current.rotation.z =
      Math.cos(time * 0.18) *
        0.025 *
        motion;

    /*
     * Build from the centre.
     */
    const breathing =
      1 +
      Math.sin(time * 0.7) *
        0.025 *
        motion;

    const buildScale =
      THREE.MathUtils.lerp(
        0.08,
        1,
        introEase
      );

    group.current.scale.setScalar(
      responsiveScale *
        breathing *
        buildScale
    );

    /*
     * Organic surface deformation.
     *
     * Desktop gets the full treatment.
     * Mobile gets a much cheaper and calmer version.
     */
    const position = geometry.attributes.position;

    const original =
      geometry.userData.originalPositions as Float32Array;

    cursorDirection
      .set(mx, -my, 0.75)
      .normalize();

    const vertexCount = position.count;

    for (let i = 0; i < vertexCount; i++) {
      const index = i * 3;

      const ox = original[index];
      const oy = original[index + 1];
      const oz = original[index + 2];

      const length = Math.sqrt(
        ox * ox +
          oy * oy +
          oz * oz
      );

      const nx = ox / length;
      const ny = oy / length;
      const nz = oz / length;

      const baseWave =
        Math.sin(
          ox * 2.6 +
            time * 0.5
        ) * 0.025;

      const secondWave = isMobile
        ? 0
        : Math.sin(
            oy * 3.2 -
              time * 0.42
          ) * 0.018;

      const cursorInfluence =
        Math.max(
          0,
          nx * cursorDirection.x +
            ny * cursorDirection.y +
            nz * cursorDirection.z
        );

      const cursorDeformation = isMobile
        ? cursorInfluence * 0.035
        : cursorInfluence *
          cursorInfluence *
          0.075;

      const displacement =
        (
          baseWave +
          secondWave +
          cursorDeformation
        ) *
        motion;

      position.setXYZ(
        i,
        ox + nx * displacement,
        oy + ny * displacement,
        oz + nz * displacement
      );
    }

    position.needsUpdate = true;

    /*
     * Outer shell.
     */
    if (shell.current) {
      shell.current.rotation.x =
        -time *
          (isMobile ? 0.025 : 0.055) *
          motion;

      shell.current.rotation.y =
        time *
          (isMobile ? 0.035 : 0.065) *
          motion;

      shell.current.rotation.z =
        mx * 0.12;

      const shellScale =
        1 +
        Math.sin(time * 0.38) *
          (isMobile ? 0.012 : 0.022) *
          motion;

      shell.current.scale.setScalar(
        shellScale
      );
    }

    /*
     * Fine orbital ring.
     */
    if (ring.current) {
      ring.current.rotation.x =
        Math.PI * 0.28 +
        Math.sin(time * 0.2) *
          0.08 *
          motion;

      ring.current.rotation.y =
        time *
          (isMobile ? 0.04 : 0.075) *
          motion;

      ring.current.rotation.z =
        mx * 0.15;

      ring.current.scale.setScalar(
        0.96 +
          Math.sin(time * 0.55) *
            0.015 *
            motion
      );
    }

    /*
     * Core material subtly changes opacity during assembly.
     */
    const coreMaterial =
      core.current.material as THREE.MeshBasicMaterial;

    coreMaterial.opacity =
      0.13 +
      introEase * 0.035;

    if (shell.current) {
      const shellMaterial =
        shell.current.material as THREE.MeshBasicMaterial;

      shellMaterial.opacity =
        0.025 +
        introEase * 0.035;
    }
  });

  return (
    <group ref={group}>
      <mesh
        ref={core}
        geometry={geometry}
        scale={1.02}
      >
        <meshBasicMaterial
          color="#dce8e0"
          transparent
          opacity={0.15}
          wireframe
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh
        ref={shell}
        geometry={shellGeometry}
      >
        <meshBasicMaterial
          color="#a9bdb1"
          transparent
          opacity={0.045}
          wireframe
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh
        ref={ring}
        geometry={ringGeometry}
        rotation={[
          Math.PI * 0.28,
          0,
          0,
        ]}
      >
        <meshBasicMaterial
          color="#dce8e0"
          transparent
          opacity={0.09}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh scale={0.72}>
        <sphereGeometry
          args={[
            1,
            isMobile ? 12 : 18,
            isMobile ? 12 : 18,
          ]}
        />

        <meshBasicMaterial
          color="#e5eee8"
          transparent
          opacity={0.012}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  return <HeroObject />;
}

export default function HeroWebGL() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
        }}
        dpr={[1, 1.15]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        performance={{
          min: 0.65,
        }}
      >
        <Scene />
      </Canvas>

      {/* Soft atmospheric field */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[20rem]
          w-[20rem]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[80px]
          sm:h-[25rem]
          sm:w-[25rem]
          sm:blur-[95px]
          md:h-[29rem]
          md:w-[29rem]
          md:blur-[105px]
        "
        style={{
          background:
            "radial-gradient(circle, rgba(180,205,190,0.07) 0%, rgba(120,150,135,0.025) 38%, transparent 70%)",
        }}
      />

      {/* Small centre glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-20
          w-20
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[35px]
          sm:h-24
          sm:w-24
          md:h-28
          md:w-28
          md:blur-[45px]
        "
        style={{
          background:
            "radial-gradient(circle, rgba(220,235,225,0.105), transparent 70%)",
        }}
      />

      {/* Fine central point */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-1
          w-1
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-white/25
          blur-[1px]
        "
      />
    </div>
  );
}