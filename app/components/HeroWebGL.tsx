"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type PointerState = {
  x: number;
  y: number;
};

// Advanced Refractive Glass & Dispersion Shader
const RefractionGlassShader = {
  uniforms: {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uBaseColor: { value: new THREE.Color("#0d1310") },
    uGlowColor: { value: new THREE.Color("#7df9ff") },
    uRimColor: { value: new THREE.Color("#b4ece1") },
    uIntro: { value: 0 },
  },
  vertexShader: `
    uniform float uTime;
    uniform vec2 uPointer;
    uniform float uIntro;

    varying vec3 vNormal;
    varying vec3 vEyeVector;
    varying vec3 vWorldPosition;
    varying float vDisplacement;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec3 pos = position;

      // Complex dual-frequency harmonic wave
      float wave1 = sin(pos.x * 2.5 + uTime * 0.9) * cos(pos.y * 2.2 + uTime * 0.7);
      float wave2 = cos(pos.z * 3.0 + uTime * 1.1) * sin(pos.x * 1.8 + uTime * 0.5);
      
      // Dynamic magnetic cursor deformation
      float distToCursor = max(0.0, dot(vNormal, normalize(vec3(uPointer * 1.5, 1.0))));
      float magneticPull = pow(distToCursor, 2.5) * 0.22;

      float totalDisplacement = (wave1 * 0.06 + wave2 * 0.04 + magneticPull) * uIntro;
      vDisplacement = totalDisplacement;

      pos += normal * totalDisplacement;
      
      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPosition.xyz;
      vEyeVector = normalize(worldPosition.xyz - cameraPosition);

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uBaseColor;
    uniform vec3 uGlowColor;
    uniform vec3 uRimColor;
    uniform float uIntro;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vEyeVector;
    varying vec3 vWorldPosition;
    varying float vDisplacement;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 eyeVector = normalize(vEyeVector);

      // Fresnel rim effect (Glass transmission)
      float fresnel = pow(1.0 + dot(eyeVector, normal), 3.0);
      
      // Internal light scattering calculation
      float internalScattering = max(0.0, dot(-eyeVector, normal));
      internalScattering = pow(internalScattering, 4.0);

      // Chromatic dispersion shimmer along edges
      float chromatic = sin(uTime * 2.0 + vWorldPosition.y * 4.0) * 0.5 + 0.5;
      vec3 dispersionColor = mix(uGlowColor, uRimColor, chromatic);

      // Composite final liquid glass shade
      vec3 finalColor = mix(uBaseColor, dispersionColor, fresnel * 0.85);
      finalColor += uGlowColor * (internalScattering * 0.35 + vDisplacement * 1.2);

      float alpha = (fresnel * 0.75 + 0.18 + vDisplacement * 0.4) * uIntro;

      gl_FragColor = vec4(finalColor, min(alpha, 0.92));
    }
  `,
};

function HeroSculpture() {
  const group = useRef<THREE.Group>(null);
  const mainMesh = useRef<THREE.Mesh>(null);
  const haloRing = useRef<THREE.Mesh>(null);
  const outerTorus = useRef<THREE.Mesh>(null);

  const pointer = useRef<PointerState>({ x: 0, y: 0 });
  const targetPointer = useRef<PointerState>({ x: 0, y: 0 });

  const intro = useRef(0);
  const viewport = useThree((state) => state.viewport);

  const glassMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(RefractionGlassShader.uniforms),
      vertexShader: RefractionGlassShader.vertexShader,
      fragmentShader: RefractionGlassShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  const coreGeo = useMemo(() => new THREE.IcosahedronGeometry(1.4, 16), []);
  const haloGeo = useMemo(() => new THREE.TorusGeometry(1.85, 0.008, 16, 100), []);
  const torusGeo = useMemo(() => new THREE.TorusGeometry(2.25, 0.003, 16, 120), []);

  const isMobile = viewport.width < 5;
  const responsiveScale = isMobile ? 0.55 : viewport.width < 7 ? 0.75 : 0.95;

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      targetPointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      targetPointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    const time = state.clock.getElapsedTime();

    intro.current = THREE.MathUtils.damp(intro.current, 1, 3.5, delta);
    const introEase = THREE.MathUtils.smoothstep(intro.current, 0, 1);

    pointer.current.x = THREE.MathUtils.lerp(pointer.current.x, targetPointer.current.x, 0.05);
    pointer.current.y = THREE.MathUtils.lerp(pointer.current.y, targetPointer.current.y, 0.05);

    const px = pointer.current.x;
    const py = pointer.current.y;

    glassMaterial.uniforms.uTime.value = time;
    glassMaterial.uniforms.uPointer.value.set(px, py);
    glassMaterial.uniforms.uIntro.value = introEase;

    // Responsive position drift
    group.current.position.x = Math.sin(time * 0.4) * 0.06 + px * 0.12;
    group.current.position.y = Math.cos(time * 0.3) * 0.07 - py * 0.08;

    group.current.rotation.y = time * 0.08 + px * 0.25;
    group.current.rotation.x = Math.sin(time * 0.25) * 0.05 - py * 0.18;

    const breathe = 1 + Math.sin(time * 0.7) * 0.025;
    group.current.scale.setScalar(responsiveScale * breathe * introEase);

    if (haloRing.current) {
      haloRing.current.rotation.x = Math.PI * 0.4 + Math.sin(time * 0.3) * 0.08;
      haloRing.current.rotation.y = time * 0.12;
    }

    if (outerTorus.current) {
      outerTorus.current.rotation.x = -Math.PI * 0.3 + Math.cos(time * 0.25) * 0.05;
      outerTorus.current.rotation.z = -time * 0.06;
    }
  });

  return (
    <group ref={group}>
      {/* Central Refractive Liquid Mesh */}
      <mesh ref={mainMesh} geometry={coreGeo} material={glassMaterial} />

      {/* Internal Luminous Core */}
      <mesh scale={0.55}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#9bf2ea"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Dynamic Inner Light Ring */}
      <mesh ref={haloRing} geometry={haloGeo}>
        <meshBasicMaterial
          color="#c8fcea"
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Fine Outer Orbit Ring */}
      <mesh ref={outerTorus} geometry={torusGeo}>
        <meshBasicMaterial
          color="#5eead4"
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
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
          stencil: false,
          depth: true,
        }}
        performance={{ min: 0.75 }}
      >
        <HeroSculpture />
      </Canvas>

      {/* Atmospheric Soft Light Aura */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[26rem]
          w-[26rem]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          blur-[100px]
          sm:h-[32rem]
          sm:w-[32rem]
          sm:blur-[120px]
        "
        style={{
          background:
            "radial-gradient(circle, rgba(94, 234, 212, 0.09) 0%, rgba(15, 23, 42, 0) 70%)",
        }}
      />
    </div>
  );
}