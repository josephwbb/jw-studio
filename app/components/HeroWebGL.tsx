"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type MouseState = {
  x: number;
  y: number;
};

function AbstractObject() {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const secondaryMesh = useRef<THREE.Mesh>(null);
  const ringGroup = useRef<THREE.Group>(null);
  const constructionGroup = useRef<THREE.Group>(null);

  const mainMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const secondaryMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const innerMaterial = useRef<THREE.MeshBasicMaterial>(null);

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

  const isMobile = viewport.width < 5;

  /*
   * ---------------------------------------------------------
   * INPUT SYSTEM
   *
   * Cursor behaviour deliberately preserved.
   * ---------------------------------------------------------
   */

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
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener("scroll", handleScroll);

      mediaQuery.removeEventListener(
        "change",
        handleMotionPreference
      );
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * MAIN FORM
   *
   * Desktop keeps the detailed geometry.
   *
   * Mobile uses a single subdivision level. This is
   * intentionally much cheaper to animate.
   * ---------------------------------------------------------
   */

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(
      1.55,
      isMobile ? 1 : 4
    );

    if (!isMobile) {
      const position = geo.attributes.position;

      const original = new Float32Array(
        position.array.length
      );

      original.set(position.array);

      geo.userData.originalPositions = original;

      /*
       * Pre-calculate the vertex normals used by the
       * desktop deformation system.
       *
       * This removes square-root work from every frame.
       */
      const directions = new Float32Array(
        position.count * 3
      );

      for (let i = 0; i < position.count; i++) {
        const index = i * 3;

        const x = original[index];
        const y = original[index + 1];
        const z = original[index + 2];

        const length = Math.sqrt(
          x * x +
            y * y +
            z * z
        );

        directions[index] = x / length;
        directions[index + 1] = y / length;
        directions[index + 2] = z / length;
      }

      geo.userData.vertexDirections = directions;
    }

    return geo;
  }, [isMobile]);

  /*
   * ---------------------------------------------------------
   * SECONDARY SHELL
   *
   * Desktop gets the extra depth layer.
   * Mobile gets a very light shell.
   * ---------------------------------------------------------
   */

  const secondaryGeometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(
      1.76,
      isMobile ? 0 : 2
    );
  }, [isMobile]);

  /*
   * ---------------------------------------------------------
   * PRIMARY ORBITAL RING
   * ---------------------------------------------------------
   */

  const ringGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const points: number[] = [];

    const segments = isMobile ? 32 : 128;

    for (let i = 0; i <= segments; i++) {
      const angle =
        (i / segments) * Math.PI * 2;

      points.push(
        Math.cos(angle) * 2.15,
        Math.sin(angle) * 2.15,
        0
      );
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        points,
        3
      )
    );

    return geometry;
  }, [isMobile]);

  /*
   * ---------------------------------------------------------
   * SECONDARY ORBITAL RING
   *
   * Desktop only.
   * ---------------------------------------------------------
   */

  const secondaryRingGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const points: number[] = [];

    const segments = 64;

    for (let i = 0; i <= segments; i++) {
      const angle =
        (i / segments) * Math.PI * 2;

      points.push(
        Math.cos(angle) * 2.55,
        Math.sin(angle) * 2.55,
        0
      );
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        points,
        3
      )
    );

    return geometry;
  }, []);

  /*
   * ---------------------------------------------------------
   * CONSTRUCTION AXES
   *
   * Mobile receives only the central cross.
   * Desktop gets the full technical drawing.
   * ---------------------------------------------------------
   */

  const constructionGeometry = useMemo(() => {
    const positions: number[] = [];

    const addLine = (
      x1: number,
      y1: number,
      z1: number,
      x2: number,
      y2: number,
      z2: number
    ) => {
      positions.push(
        x1,
        y1,
        z1,
        x2,
        y2,
        z2
      );
    };

    const size = isMobile ? 1.65 : 2.35;

    addLine(
      -size,
      0,
      0,
      size,
      0,
      0
    );

    addLine(
      0,
      -size,
      0,
      0,
      size,
      0
    );

    if (!isMobile) {
      addLine(
        0,
        0,
        -size,
        0,
        0,
        size
      );

      addLine(
        -size * 0.72,
        -size * 0.72,
        0,
        size * 0.72,
        size * 0.72,
        0
      );

      addLine(
        -size * 0.72,
        size * 0.72,
        0,
        size * 0.72,
        -size * 0.72,
        0
      );
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        positions,
        3
      )
    );

    return geometry;
  }, [isMobile]);

  /*
   * ---------------------------------------------------------
   * RESPONSIVE SCALE
   * ---------------------------------------------------------
   */

  const responsiveScale =
    viewport.width < 5
      ? 0.66
      : viewport.width < 7
        ? 0.88
        : 1;

  /*
   * ---------------------------------------------------------
   * ANIMATION
   * ---------------------------------------------------------
   */

  useFrame((state) => {
    if (!group.current || !mesh.current) {
      return;
    }

    const time =
      state.clock.getElapsedTime();

    const motionMultiplier =
      reducedMotion.current
        ? 0
        : 1;

    /*
     * -------------------------------------------------------
     * CURSOR
     *
     * Preserved.
     * -------------------------------------------------------
     */

    mouse.current.x =
      THREE.MathUtils.lerp(
        mouse.current.x,
        targetMouse.current.x,
        0.045
      );

    mouse.current.y =
      THREE.MathUtils.lerp(
        mouse.current.y,
        targetMouse.current.y,
        0.045
      );

    scroll.current =
      THREE.MathUtils.lerp(
        scroll.current,
        scrollTarget.current,
        0.035
      );

    const mx = mouse.current.x;
    const my = mouse.current.y;

    /*
     * -------------------------------------------------------
     * LOAD-IN
     *
     * Mobile deliberately takes longer.
     *
     * The point is not to make the phone wait.
     * The point is to let the lighter object reveal itself
     * gradually once it arrives.
     * -------------------------------------------------------
     */

    const buildDuration =
      isMobile ? 2.4 : 1.65;

    const buildProgress =
      THREE.MathUtils.clamp(
        time / buildDuration,
        0,
        1
      );

    const easedBuild =
      1 -
      Math.pow(
        1 - buildProgress,
        isMobile ? 3 : 4
      );

    const buildOvershoot =
      buildProgress < 1
        ? Math.sin(
            buildProgress * Math.PI
          ) *
          (isMobile ? 0.025 : 0.045)
        : 0;

    const buildScale =
      easedBuild +
      buildOvershoot;

    /*
     * -------------------------------------------------------
     * POSITION
     *
     * Mobile has a slower, calmer orbital movement.
     * -------------------------------------------------------
     */

    const orbitalX =
      Math.sin(
        time *
          (isMobile ? 0.09 : 0.16)
      ) *
      (isMobile ? 0.08 : 0.18) *
      motionMultiplier;

    const orbitalY =
      Math.cos(
        time *
          (isMobile ? 0.12 : 0.21)
      ) *
      (isMobile ? 0.06 : 0.13) *
      motionMultiplier;

    const orbitalZ =
      Math.sin(
        time *
          (isMobile ? 0.08 : 0.13)
      ) *
      (isMobile ? 0.035 : 0.08) *
      motionMultiplier;

    const cursorOffsetX =
      mx *
      (isMobile ? 0.08 : 0.18) *
      motionMultiplier;

    const cursorOffsetY =
      -my *
      (isMobile ? 0.06 : 0.12) *
      motionMultiplier;

    targetPosition.set(
      orbitalX + cursorOffsetX,
      orbitalY + cursorOffsetY,
      orbitalZ
    );

    group.current.position.lerp(
      targetPosition,
      isMobile ? 0.018 : 0.025
    );

    /*
     * -------------------------------------------------------
     * ROTATION
     * -------------------------------------------------------
     */

    group.current.rotation.y =
      time *
        (isMobile ? 0.045 : 0.075) *
        motionMultiplier +
      mx * 0.42;

    group.current.rotation.x =
      Math.sin(
        time *
          (isMobile ? 0.11 : 0.19)
      ) *
        (isMobile ? 0.055 : 0.11) *
        motionMultiplier +
      my * -0.28;

    group.current.rotation.z =
      Math.cos(
        time *
          (isMobile ? 0.09 : 0.16)
      ) *
        (isMobile ? 0.025 : 0.055) *
        motionMultiplier +
      mx * 0.08;

    /*
     * Scroll influence remains subtle.
     */

    group.current.rotation.y +=
      scroll.current * 0.00022;

    group.current.rotation.x +=
      scroll.current * 0.000035;

    /*
     * -------------------------------------------------------
     * BREATHING
     * -------------------------------------------------------
     */

    const breathing =
      1 +
      Math.sin(
        time *
          (isMobile ? 0.42 : 0.62)
      ) *
        (isMobile ? 0.018 : 0.035) *
        motionMultiplier;

    const depthPulse =
      1 +
      Math.cos(
        time *
          (isMobile ? 0.28 : 0.42)
      ) *
        (isMobile ? 0.007 : 0.012) *
        motionMultiplier;

    group.current.scale.setScalar(
      responsiveScale *
        breathing *
        depthPulse *
        buildScale
    );

    /*
     * -------------------------------------------------------
     * DESKTOP ORGANIC DEFORMATION
     *
     * This is the expensive part.
     *
     * It is completely removed from the mobile animation
     * loop. Mobile still has the rotating crystalline form,
     * but does not make the CPU rewrite every vertex.
     * -------------------------------------------------------
     */

    if (!isMobile) {
      const position =
        geometry.attributes.position;

      const original =
        geometry.userData
          .originalPositions as Float32Array;

      const directions =
        geometry.userData
          .vertexDirections as Float32Array;

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

        const ox =
          original[index];

        const oy =
          original[index + 1];

        const oz =
          original[index + 2];

        const nx =
          directions[index];

        const ny =
          directions[index + 1];

        const nz =
          directions[index + 2];

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

        const dot =
          nx *
            cursorDirection.x +
          ny *
            cursorDirection.y +
          nz *
            cursorDirection.z;

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
    }

    /*
     * -------------------------------------------------------
     * SECONDARY SHELL
     * -------------------------------------------------------
     */

    if (secondaryMesh.current) {
      secondaryMesh.current.rotation.x =
        -time *
        (isMobile ? 0.035 : 0.105) *
        motionMultiplier;

      secondaryMesh.current.rotation.y =
        time *
        (isMobile ? 0.025 : 0.08) *
        motionMultiplier;

      secondaryMesh.current.rotation.z =
        mx * 0.22;

      if (!isMobile) {
        secondaryMesh.current.position.x =
          Math.sin(time * 0.12) *
          0.035 *
          motionMultiplier;

        secondaryMesh.current.position.y =
          Math.cos(time * 0.15) *
          0.025 *
          motionMultiplier;

        secondaryMesh.current.scale.setScalar(
          1 +
            Math.sin(time * 0.43) *
              0.025 *
              motionMultiplier
        );
      }
    }

    /*
     * -------------------------------------------------------
     * ORBITAL SYSTEM
     * -------------------------------------------------------
     */

    if (ringGroup.current) {
      ringGroup.current.rotation.x =
        Math.sin(
          time *
            (isMobile ? 0.08 : 0.17)
        ) *
        (isMobile ? 0.12 : 0.25) *
        motionMultiplier;

      ringGroup.current.rotation.y =
        time *
        (isMobile ? 0.018 : 0.055) *
        motionMultiplier;

      ringGroup.current.rotation.z =
        mx * 0.12;

      ringGroup.current.scale.setScalar(
        THREE.MathUtils.lerp(
          isMobile ? 0.65 : 0.45,
          1,
          easedBuild
        )
      );
    }

    /*
     * -------------------------------------------------------
     * CONSTRUCTION SYSTEM
     * -------------------------------------------------------
     */

    if (constructionGroup.current) {
      constructionGroup.current.rotation.x =
        -time *
        (isMobile ? 0.012 : 0.04) *
        motionMultiplier;

      constructionGroup.current.rotation.y =
        time *
        (isMobile ? 0.018 : 0.055) *
        motionMultiplier;

      constructionGroup.current.rotation.z =
        -mx * 0.08;

      constructionGroup.current.scale.setScalar(
        THREE.MathUtils.lerp(
          isMobile ? 0.5 : 0.25,
          1,
          easedBuild
        )
      );
    }

    /*
     * -------------------------------------------------------
     * MATERIAL ASSEMBLY
     * -------------------------------------------------------
     */

    if (mainMaterial.current) {
      mainMaterial.current.opacity =
        THREE.MathUtils.lerp(
          0,
          isMobile ? 0.15 : 0.21,
          easedBuild
        );
    }

    if (secondaryMaterial.current) {
      secondaryMaterial.current.opacity =
        THREE.MathUtils.lerp(
          0,
          isMobile ? 0.025 : 0.06,
          easedBuild
        );
    }

    if (innerMaterial.current) {
      innerMaterial.current.opacity =
        THREE.MathUtils.lerp(
          0,
          isMobile ? 0.008 : 0.022,
          easedBuild
        );
    }
  });

  return (
    <group
      ref={group}
      position={[0, 0, 0]}
    >
      {/*
       * -------------------------------------------------------
       * CONSTRUCTION SYSTEM
       * -------------------------------------------------------
       */}

      <group ref={constructionGroup}>
        <lineSegments
          geometry={constructionGeometry}
        >
          <lineBasicMaterial
            color="#dce8e0"
            transparent
            opacity={isMobile ? 0.035 : 0.055}
            depthWrite={false}
          />
        </lineSegments>

        {!isMobile && (
          <>
            <mesh
              position={[0, 0, 0]}
              rotation={[
                Math.PI / 2,
                0,
                0,
              ]}
            >
              <ringGeometry
                args={[
                  1.64,
                  1.645,
                  96,
                ]}
              />

              <meshBasicMaterial
                color="#dce8e0"
                transparent
                opacity={0.055}
                depthWrite={false}
              />
            </mesh>

            <mesh
              position={[0, 0, 0]}
              rotation={[
                0,
                Math.PI / 2,
                0,
              ]}
            >
              <ringGeometry
                args={[
                  1.64,
                  1.645,
                  96,
                ]}
              />

              <meshBasicMaterial
                color="#dce8e0"
                transparent
                opacity={0.035}
                depthWrite={false}
              />
            </mesh>
          </>
        )}
      </group>

      {/*
       * -------------------------------------------------------
       * MAIN LIVING OBJECT
       * -------------------------------------------------------
       */}

      <mesh
        ref={mesh}
        geometry={geometry}
        scale={1.05}
      >
        <meshBasicMaterial
          ref={mainMaterial}
          color="#dce8e0"
          transparent
          opacity={0.17}
          wireframe
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/*
       * -------------------------------------------------------
       * SECONDARY DEPTH SHELL
       * -------------------------------------------------------
       */}

      <mesh
        ref={secondaryMesh}
        geometry={secondaryGeometry}
        scale={isMobile ? 0.96 : 1}
      >
        <meshBasicMaterial
          ref={secondaryMaterial}
          color="#aabdb2"
          transparent
          opacity={0.055}
          wireframe
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/*
       * -------------------------------------------------------
       * INTERNAL VOLUME
       *
       * Mobile uses a tiny primitive.
       * -------------------------------------------------------
       */}

      <mesh
        scale={
          isMobile
            ? 0.76
            : 0.82
        }
      >
        <sphereGeometry
          args={[
            1,
            isMobile ? 6 : 24,
            isMobile ? 6 : 24,
          ]}
        />

        <meshBasicMaterial
          ref={innerMaterial}
          color="#dce8e0"
          transparent
          opacity={0.018}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/*
       * -------------------------------------------------------
       * ORBITAL RINGS
       * -------------------------------------------------------
       */}

      <group ref={ringGroup}>
        <lineLoop
          geometry={ringGeometry}
          rotation={[
            Math.PI / 2.7,
            0.12,
            0.2,
          ]}
        >
          <lineBasicMaterial
            color="#dce8e0"
            transparent
            opacity={
              isMobile
                ? 0.035
                : 0.075
            }
            depthWrite={false}
          />
        </lineLoop>

        {!isMobile && (
          <>
            <lineLoop
              geometry={
                secondaryRingGeometry
              }
              rotation={[
                0.4,
                Math.PI / 2.2,
                -0.25,
              ]}
            >
              <lineBasicMaterial
                color="#b8ccc0"
                transparent
                opacity={0.045}
                depthWrite={false}
              />
            </lineLoop>

            <lineLoop
              geometry={ringGeometry}
              rotation={[
                -0.8,
                0.5,
                0.8,
              ]}
              scale={0.72}
            >
              <lineBasicMaterial
                color="#dce8e0"
                transparent
                opacity={0.035}
                depthWrite={false}
              />
            </lineLoop>
          </>
        )}
      </group>

      {/*
       * -------------------------------------------------------
       * DESKTOP DESIGN MARKERS
       * -------------------------------------------------------
       */}

      {!isMobile && (
        <group>
          <mesh
            position={[
              2.22,
              0,
              0,
            ]}
            rotation={[
              0,
              Math.PI / 2,
              0,
            ]}
          >
            <planeGeometry
              args={[
                0.045,
                0.45,
              ]}
            />

            <meshBasicMaterial
              color="#dce8e0"
              transparent
              opacity={0.11}
              depthWrite={false}
            />
          </mesh>

          <mesh
            position={[
              -2.22,
              0,
              0,
            ]}
            rotation={[
              0,
              Math.PI / 2,
              0,
            ]}
          >
            <planeGeometry
              args={[
                0.045,
                0.28,
              ]}
            />

            <meshBasicMaterial
              color="#dce8e0"
              transparent
              opacity={0.07}
              depthWrite={false}
            />
          </mesh>

          <mesh
            position={[
              0,
              2.22,
              0,
            ]}
          >
            <planeGeometry
              args={[
                0.45,
                0.045,
              ]}
            />

            <meshBasicMaterial
              color="#dce8e0"
              transparent
              opacity={0.09}
              depthWrite={false}
            />
          </mesh>

          <mesh
            position={[
              0,
              -2.22,
              0,
            ]}
          >
            <planeGeometry
              args={[
                0.25,
                0.045,
              ]}
            />

            <meshBasicMaterial
              color="#dce8e0"
              transparent
              opacity={0.06}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Scene() {
  return <AbstractObject />;
}

export default function HeroWebGL() {
  const [isMobile, setIsMobile] =
    useState(false);

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(max-width: 767px)"
      );

    const update = () => {
      setIsMobile(
        mediaQuery.matches
      );
    };

    update();

    mediaQuery.addEventListener(
      "change",
      update
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        update
      );
    };
  }, []);

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
        /*
         * Desktop:
         * keep the sharper rendering.
         *
         * Mobile:
         * cap pixel density aggressively.
         *
         * This matters because a modern phone can have
         * several million physical pixels. Rendering WebGL
         * at full device pixel ratio is often unnecessary.
         */
        dpr={
          isMobile
            ? [0.65, 0.85]
            : [1, 1.25]
        }
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        performance={{
          min: isMobile
            ? 0.45
            : 0.7,
        }}
      >
        <Scene />
      </Canvas>

      {/*
       * ---------------------------------------------------------
       * ATMOSPHERIC BLOOM
       *
       * Kept outside WebGL.
       *
       * Mobile is deliberately smaller and less blurred.
       * ---------------------------------------------------------
       */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[14rem]
          w-[14rem]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[48px]
          sm:h-[22rem]
          sm:w-[22rem]
          sm:blur-[70px]
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
       * ---------------------------------------------------------
       * CENTRE GLOW
       * ---------------------------------------------------------
       */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-16
          w-16
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[24px]
          sm:h-24
          sm:w-24
          sm:blur-[38px]
          md:h-32
          md:w-32
          md:blur-[50px]
        "
        style={{
          background:
            "radial-gradient(circle, rgba(220,235,225,0.12), transparent 70%)",
        }}
      />

      {/*
       * ---------------------------------------------------------
       * DESKTOP GRID ATMOSPHERE
       *
       * Never rendered on mobile.
       * ---------------------------------------------------------
       */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          hidden
          opacity-[0.045]
          md:block
        "
        style={{
          backgroundImage:
            "linear-gradient(rgba(220,235,225,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(220,235,225,0.35) 1px, transparent 1px)",
          backgroundSize:
            "80px 80px",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 68%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, transparent 68%)",
        }}
      />
    </div>
  );
}