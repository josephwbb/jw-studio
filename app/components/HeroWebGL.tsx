"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

  const cursorDirection = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const targetPosition = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const viewport = useThree((state) => state.viewport);

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
   * Main geometry.
   *
   * Still detailed enough to give the object a fluid,
   * almost geological appearance, without introducing
   * particles or expensive post-processing.
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

  /*
   * Secondary shell.
   *
   * Lower subdivision keeps this extremely cheap while
   * adding another layer of depth.
   */
  const secondaryGeometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(1.78, 2);
  }, []);

  /*
   * Responsive scale.
   *
   * The object is intentionally smaller on narrow screens.
   * This prevents it competing with the JW / STUDIO typography.
   */
  const responsiveScale =
    viewport.width < 5
      ? 0.72
      : viewport.width < 7
        ? 0.88
        : 1;

  useFrame((state) => {
    if (!group.current || !mesh.current) return;

    const time = state.clock.getElapsedTime();

    /*
     * Smooth cursor interpolation.
     *
     * Deliberately slow so the object feels heavy and
     * physical rather than attached directly to the mouse.
     */
    mouse.current.x = THREE.MathUtils.lerp(
      mouse.current.x,
      targetMouse.current.x,
      0.045
    );

    mouse.current.y = THREE.MathUtils.lerp(
      mouse.current.y,
      targetMouse.current.y,
      0.045
    );

    scroll.current = THREE.MathUtils.lerp(
      scroll.current,
      scrollTarget.current,
      0.035
    );

    const mx = mouse.current.x;
    const my = mouse.current.y;

    const motionMultiplier = reducedMotion.current
      ? 0
      : 1;

    /*
     * ---------------------------------------------------------
     * 3D ORBITAL MOVEMENT
     * ---------------------------------------------------------
     *
     * Rather than keeping the object locked to the centre,
     * it gently travels around a small invisible 3D path.
     *
     * The movement is deliberately tiny.
     */
    const orbitalX =
      Math.sin(time * 0.16) *
      0.18 *
      motionMultiplier;

    const orbitalY =
      Math.cos(time * 0.21) *
      0.13 *
      motionMultiplier;

    const orbitalZ =
      Math.sin(time * 0.13) *
      0.08 *
      motionMultiplier;

    /*
     * Cursor creates a second, slower positional layer.
     *
     * This makes the object feel like it occupies space
     * behind the page rather than being a flat animation.
     */
    const cursorOffsetX =
      mx * 0.18 * motionMultiplier;

    const cursorOffsetY =
      -my * 0.12 * motionMultiplier;

    targetPosition.set(
      orbitalX + cursorOffsetX,
      orbitalY + cursorOffsetY,
      orbitalZ
    );

    group.current.position.lerp(
      targetPosition,
      0.025
    );

    /*
     * ---------------------------------------------------------
     * CONTINUOUS 3D ROTATION
     * ---------------------------------------------------------
     *
     * Multiple rotation axes create the feeling of a genuine
     * three-dimensional object rather than a rotating icon.
     */
    group.current.rotation.y =
      time * 0.075 * motionMultiplier +
      mx * 0.42;

    group.current.rotation.x =
      Math.sin(time * 0.19) *
        0.11 *
        motionMultiplier +
      my * -0.28;

    group.current.rotation.z =
      Math.cos(time * 0.16) *
        0.055 *
        motionMultiplier +
      mx * 0.08;

    /*
     * Scroll adds a very subtle change to the object's
     * orientation without making the hero feel unstable.
     */
    group.current.rotation.y +=
      scroll.current * 0.00022;

    group.current.rotation.x +=
      scroll.current * 0.000035;

    /*
     * ---------------------------------------------------------
     * BREATHING / DEPTH
     * ---------------------------------------------------------
     */
    const breathing =
      1 +
      Math.sin(time * 0.62) *
        0.035 *
        motionMultiplier;

    const depthPulse =
      1 +
      Math.cos(time * 0.42) *
        0.012 *
        motionMultiplier;

    const finalScale =
      responsiveScale *
      breathing *
      depthPulse;

    group.current.scale.setScalar(finalScale);

    /*
     * ---------------------------------------------------------
     * ORGANIC SURFACE DEFORMATION
     * ---------------------------------------------------------
     */
    const position = geometry.attributes.position;

    const original =
      geometry.userData
        .originalPositions as Float32Array;

    /*
     * Reuse the same vector rather than creating a new
     * THREE.Vector3 for every vertex on every frame.
     */
    cursorDirection.set(
      mx * 1.4,
      -my * 1.4,
      0.8
    ).normalize();

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
        ox * ox +
          oy * oy +
          oz * oz
      );

      const nx = ox / length;
      const ny = oy / length;
      const nz = oz / length;

      /*
       * Three slow waves overlap to create an organic
       * surface movement.
       */
      const wave1 =
        Math.sin(
          ox * 2.8 +
            time * 0.65
        ) * 0.035;

      const wave2 =
        Math.sin(
          oy * 3.4 -
            time * 0.5
        ) * 0.025;

      const wave3 =
        Math.sin(
          oz * 4.1 +
            time * 0.35
        ) * 0.02;

      /*
       * Cursor pushes the visible side of the object.
       */
      const dot =
        nx * cursorDirection.x +
        ny * cursorDirection.y +
        nz * cursorDirection.z;

      const cursorInfluence =
        Math.max(0, dot);

      const cursorDeformation =
        cursorInfluence *
        cursorInfluence *
        0.13;

      const displacement =
        (
          wave1 +
          wave2 +
          wave3 +
          cursorDeformation
        ) *
        motionMultiplier;

      position.setXYZ(
        i,
        ox + nx * displacement,
        oy + ny * displacement,
        oz + nz * displacement
      );
    }

    position.needsUpdate = true;

    /*
     * ---------------------------------------------------------
     * SECONDARY ORBITAL SHELL
     * ---------------------------------------------------------
     */
    if (secondaryMesh.current) {
      secondaryMesh.current.rotation.x =
        -time *
          0.105 *
          motionMultiplier;

      secondaryMesh.current.rotation.y =
        time *
          0.08 *
          motionMultiplier;

      secondaryMesh.current.rotation.z =
        mx * 0.22;

      /*
       * The outer shell also moves very slightly
       * independently, creating parallax between the layers.
       */
      secondaryMesh.current.position.x =
        Math.sin(time * 0.12) *
        0.035 *
        motionMultiplier;

      secondaryMesh.current.position.y =
        Math.cos(time * 0.15) *
        0.025 *
        motionMultiplier;

      const secondaryScale =
        1 +
        Math.sin(time * 0.43) *
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
      {/*
       * MAIN LIVING OBJECT
       */}
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

      {/*
       * SECONDARY DEPTH SHELL
       */}
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

      {/*
       * VERY SUBTLE INTERNAL VOLUME
       */}
      <mesh scale={0.82}>
        <sphereGeometry
          args={[1, 24, 24]}
        />

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
        dpr={[1, 1.25]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        performance={{
          min: 0.7,
        }}
      >
        <Scene />
      </Canvas>

      {/*
       * ATMOSPHERIC BLOOM
       *
       * Smaller on mobile so it doesn't wash over the
       * typography or make the hero feel cramped.
       */}
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
          blur-[90px]
          sm:h-[30rem]
          sm:w-[30rem]
          sm:blur-[100px]
          md:h-[34rem]
          md:w-[34rem]
          md:blur-[110px]
        "
        style={{
          background:
            "radial-gradient(circle, rgba(180,205,190,0.075) 0%, rgba(120,150,135,0.025) 35%, transparent 70%)",
        }}
      />

      {/*
       * CENTRE GLOW
       */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-24
          w-24
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[38px]
          sm:h-28
          sm:w-28
          sm:blur-[44px]
          md:h-32
          md:w-32
          md:blur-[50px]
        "
        style={{
          background:
            "radial-gradient(circle, rgba(220,235,225,0.12), transparent 70%)",
        }}
      />
    </div>
  );
}