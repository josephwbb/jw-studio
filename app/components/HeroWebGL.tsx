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

  /*
   * Mobile uses a substantially lighter geometry budget.
   *
   * Desktop:
   * high subdivision organic form
   *
   * Mobile:
   * lower subdivision, fewer supporting elements,
   * simpler orbital system.
   */
  const isMobile = viewport.width < 5;

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
   * MAIN FORM
   *
   * Desktop gets the detailed surface.
   * Mobile deliberately uses fewer vertices.
   */
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(
      1.55,
      isMobile ? 2 : 4
    );

    const position = geo.attributes.position;

    const original = new Float32Array(
      position.array.length
    );

    original.set(position.array);

    geo.userData.originalPositions = original;

    return geo;
  }, [isMobile]);

  /*
   * SECONDARY SHELL
   */
  const secondaryGeometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(
      1.78,
      isMobile ? 1 : 2
    );
  }, [isMobile]);

  /*
   * TECHNICAL RINGS
   *
   * These give the WebGL a more deliberate,
   * designed-system feeling rather than just
   * "floating 3D object".
   */
  const ringGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const points: number[] = [];
    const segments = isMobile ? 64 : 128;

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
      new THREE.Float32BufferAttribute(points, 3)
    );

    return geometry;
  }, [isMobile]);

  const secondaryRingGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const points: number[] = [];
    const segments = isMobile ? 48 : 96;

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
      new THREE.Float32BufferAttribute(points, 3)
    );

    return geometry;
  }, [isMobile]);

  /*
   * Construction lines.
   *
   * These are intentionally restrained.
   * They should feel like the visual identity
   * of the object is being assembled in real time.
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

    const size = isMobile ? 1.85 : 2.35;

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

    addLine(
      0,
      0,
      -size,
      0,
      0,
      size
    );

    if (!isMobile) {
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
   * Responsive scale.
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
     * ---------------------------------------------------------
     * CURSOR SYSTEM
     *
     * Intentionally preserved.
     * ---------------------------------------------------------
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
     * LOAD-IN ASSEMBLY
     *
     * The object begins as a tiny point in space and
     * gradually resolves into the finished system.
     *
     * This runs only once because elapsed time is used
     * directly and capped.
     * ---------------------------------------------------------
     */

    const buildDuration = isMobile ? 1.35 : 1.65;

    const buildProgress = THREE.MathUtils.clamp(
      time / buildDuration,
      0,
      1
    );

    const easedBuild =
      1 -
      Math.pow(
        1 - buildProgress,
        4
      );

    const buildOvershoot =
      buildProgress < 1
        ? Math.sin(
            buildProgress * Math.PI
          ) * 0.045
        : 0;

    const buildScale =
      easedBuild + buildOvershoot;

    /*
     * ---------------------------------------------------------
     * 3D ORBITAL MOVEMENT
     * ---------------------------------------------------------
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
     * Scroll adds a very subtle change.
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
      depthPulse *
      buildScale;

    group.current.scale.setScalar(
      finalScale
    );

    /*
     * ---------------------------------------------------------
     * ORGANIC SURFACE DEFORMATION
     * ---------------------------------------------------------
     */

    const position =
      geometry.attributes.position;

    const original =
      geometry.userData
        .originalPositions as Float32Array;

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
       * Slightly richer desktop surface movement.
       * Mobile uses a smaller amount of deformation.
       */
      const waveStrength =
        isMobile ? 0.62 : 1;

      const wave1 =
        Math.sin(
          ox * 2.8 +
            time * 0.65
        ) *
        0.035 *
        waveStrength;

      const wave2 =
        Math.sin(
          oy * 3.4 -
            time * 0.5
        ) *
        0.025 *
        waveStrength;

      const wave3 =
        Math.sin(
          oz * 4.1 +
            time * 0.35
        ) *
        0.02 *
        waveStrength;

      /*
       * Cursor pushes the visible side.
       * Preserved from the existing system.
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
          (isMobile ? 0.075 : 0.105) *
          motionMultiplier;

      secondaryMesh.current.rotation.y =
        time *
          (isMobile ? 0.06 : 0.08) *
          motionMultiplier;

      secondaryMesh.current.rotation.z =
        mx * 0.22;

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

    /*
     * ---------------------------------------------------------
     * ORBITAL DESIGN SYSTEM
     * ---------------------------------------------------------
     */

    if (ringGroup.current) {
      ringGroup.current.rotation.x =
        Math.sin(time * 0.17) *
        0.25 *
        motionMultiplier;

      ringGroup.current.rotation.y =
        time *
        (isMobile ? 0.035 : 0.055) *
        motionMultiplier;

      ringGroup.current.rotation.z =
        mx * 0.12;

      const ringScale =
        THREE.MathUtils.lerp(
          0.45,
          1,
          easedBuild
        );

      ringGroup.current.scale.setScalar(
        ringScale
      );
    }

    /*
     * Construction axis movement.
     */
    if (constructionGroup.current) {
      constructionGroup.current.rotation.x =
        -time *
        (isMobile ? 0.025 : 0.04) *
        motionMultiplier;

      constructionGroup.current.rotation.y =
        time *
        (isMobile ? 0.035 : 0.055) *
        motionMultiplier;

      constructionGroup.current.rotation.z =
        -mx * 0.08;

      constructionGroup.current.scale.setScalar(
        THREE.MathUtils.lerp(
          0.25,
          1,
          easedBuild
        )
      );
    }

    /*
     * Material assembly.
     *
     * The visual system appears in layers:
     *
     * 1. construction geometry
     * 2. outer ring
     * 3. main object
     * 4. internal volume
     */
    if (mainMaterial.current) {
      mainMaterial.current.opacity =
        THREE.MathUtils.lerp(
          0,
          isMobile ? 0.18 : 0.21,
          easedBuild
        );
    }

    if (secondaryMaterial.current) {
      secondaryMaterial.current.opacity =
        THREE.MathUtils.lerp(
          0,
          isMobile ? 0.035 : 0.06,
          easedBuild
        );
    }

    if (innerMaterial.current) {
      innerMaterial.current.opacity =
        THREE.MathUtils.lerp(
          0,
          isMobile ? 0.012 : 0.022,
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
            opacity={0.055}
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
       * -------------------------------------------------------
       */}

      <mesh
        scale={isMobile ? 0.78 : 0.82}
      >
        <sphereGeometry
          args={[
            1,
            isMobile ? 12 : 24,
            isMobile ? 12 : 24,
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
              isMobile ? 0.045 : 0.075
            }
            depthWrite={false}
          />
        </lineLoop>

        {!isMobile && (
          <>
            <lineLoop
              geometry={secondaryRingGeometry}
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
       * SMALL DESIGN MARKERS
       *
       * Desktop only.
       * These are deliberately sparse.
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
       * ---------------------------------------------------------
       * ATMOSPHERIC BLOOM
       * ---------------------------------------------------------
       *
       * Kept outside WebGL so the expensive blur remains a
       * browser-composited effect rather than another 3D pass.
       *
       * Mobile is deliberately smaller.
       */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[19rem]
          w-[19rem]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[75px]
          sm:h-[26rem]
          sm:w-[26rem]
          sm:blur-[90px]
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
          h-20
          w-20
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[30px]
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

      {/*
       * VERY SUBTLE DESKTOP GRID ATMOSPHERE
       *
       * This is CSS rather than another WebGL layer.
       * It makes the object feel embedded inside a designed
       * digital environment.
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