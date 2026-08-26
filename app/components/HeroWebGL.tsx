"use client";

import { Canvas, useFrame,  extend } from "@react-three/fiber";
import { Environment, shaderMaterial } from "@react-three/drei";
import { useRef,useMemo, useState } from "react";
import * as THREE from "three";

const FresnelMaterial = shaderMaterial(
  {
    color: new THREE.Color("#dfeee5"),
    power: 2.5,
    intensity: 1.4,
  },
  `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);

      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  `
    uniform vec3 color;
    uniform float power;
    uniform float intensity;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {

      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);

      float fresnel = pow(
        1.0 - max(dot(vNormal, viewDirection), 0.0),
        power
      );

      float glow = fresnel * intensity;

      gl_FragColor = vec4(
        color * glow,
        glow
      );
    }
  `
);

extend({ FresnelMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    fresnelMaterial: any;
  }
}

function Particles() {
  const points = useRef<THREE.Points>(null);

  const particleCount = 350;

  const positions = useMemo(() => {
    const array = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      array[i * 3] = (Math.random() - 0.5) * 7;
      array[i * 3 + 1] = (Math.random() - 0.5) * 5;
      array[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }

    return array;
  }, []);

  useFrame((state, delta) => {
    if (!points.current) return;

    points.current.rotation.y += delta * 0.015;
    points.current.rotation.x += delta * 0.006;
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
        size={0.012}
        color="#dce5df"
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}


function Sculpture() {
  const group = useRef<THREE.Group>(null);

  const orbit1 = useRef<THREE.Mesh>(null);
  const orbit2 = useRef<THREE.Mesh>(null);
  const orbit3 = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;

const { pointer } = state;

    // Slow, luxurious movement
  group.current.rotation.x = THREE.MathUtils.lerp(
  group.current.rotation.x,
  pointer.y * 0.18 + Math.sin(time * 0.25) * 0.12,
  delta * 1.5
);

group.current.rotation.y = THREE.MathUtils.lerp(
  group.current.rotation.y,
  pointer.x * 0.35 + Math.sin(time * 0.18) * 0.25,
  delta * 1.5
);

    group.current.position.y = Math.sin(time * 0.5) * 0.08;
 
if (orbit1.current) {
  orbit1.current.rotation.z += delta * 0.08;
}

if (orbit2.current) {
  orbit2.current.rotation.x += delta * 0.05;
}

if (orbit3.current) {
  orbit3.current.rotation.y -= delta * 0.035;
}

});

  return (
    <group ref={group}>
      {/* Main glass form */}
      <mesh>
        <icosahedronGeometry args={[1.7, 6]} />
   <meshPhysicalMaterial
  color="#e8eee9"
  transmission={1}
  thickness={2}
  roughness={0.035}
  metalness={0.05}
  ior={1.45}
  transparent
  opacity={0.82}
  envMapIntensity={2.4}
/>
      </mesh>

<mesh scale={1.015}>
  <icosahedronGeometry args={[1.7, 6]} />
  <fresnelMaterial
    transparent
    depthWrite={false}
    blending={THREE.AdditiveBlending}
  />
</mesh>

<mesh scale={1.08}>
  <sphereGeometry args={[1.7, 64, 64]} />

  <meshBasicMaterial
    color="#c8d8ce"
    transparent
    opacity={0.055}
    side={THREE.BackSide}
  />
</mesh>




      {/* Inner form */}
      <mesh scale={0.72}>
        <icosahedronGeometry args={[1.7, 5]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1}
          thickness={1}
          roughness={0.03}
          metalness={0}
          ior={1.5}
          transparent
          opacity={0.35}
          envMapIntensity={2}
        />
      </mesh>

      {/* Core */}
      <mesh scale={0.14}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Orbit */}
     <mesh
  ref={orbit1}
  rotation={[Math.PI / 2.8, 0.3, 0]}
>
        <torusGeometry args={[2.15, 0.008, 8, 256]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.28}
        />
      </mesh>

    <mesh
  ref={orbit2}
  rotation={[1.1, 0.8, 0.4]}
>
        <torusGeometry args={[2.35, 0.005, 8, 256]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.16}
        />
      </mesh>



  <mesh
  ref={orbit3}
  rotation={[0.4, -0.8, 1.2]}
>
  <torusGeometry args={[2.65, 0.003, 8, 256]} />

  <meshBasicMaterial
    color="#dfe8e2"
    transparent
    opacity={0.10}
  />
</mesh>  

      {/* Small orbiting point */}
      <mesh position={[2.15, 0, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />

      <directionalLight
        position={[4, 5, 6]}
        intensity={2.5}
      />

    <pointLight
  position={[-4, -2, 3]}
  intensity={4}
  distance={10}
/>

  <pointLight
  position={[3, 2, -4]}
  intensity={1.5}
  distance={8}
/> 
<Particles/>

      <Sculpture />

      <Environment preset="studio" />
    </>
  );
}

export default function HeroWebGL() {
    const [ready, setReady] = useState(false);
  return (
    <div
  className={`absolute inset-0 z-[5] pointer-events-none transition-opacity duration-[1500ms] ${
    ready ? "opacity-100" : "opacity-0"
  }`}
>
      <Canvas
  camera={{
    position: [0, 0, 6],
    fov: 42,
  }}
  onCreated={() => {
    setTimeout(() => {
      setReady(true);
    }, 300);
  }}
  dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}