"use client";

/**
 * SignAvatar3D
 * Renders a 3D hand that mirrors a target ASL sign pose.
 * Uses @react-three/fiber + drei. Fingers glow red when in error.
 */

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { SignDefinition } from "@/lib/gesture/sign-definitions";

interface FingerBoneProps {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
  radius: number;
  color: string;
  hasError: boolean;
}

function FingerBone({ position, rotation, length, radius, color, hasError }: FingerBoneProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const targetEmissive = hasError ? 0.4 : 0.0;
    const current = mat.emissiveIntensity;
    mat.emissiveIntensity = THREE.MathUtils.lerp(current, targetEmissive, delta * 8);
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow>
      <capsuleGeometry args={[radius, length, 6, 10]} />
      <meshStandardMaterial
        color={hasError ? "#ef4444" : color}
        emissive={hasError ? "#ef4444" : "#000000"}
        emissiveIntensity={0}
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  );
}

interface FingerProps {
  basePosition: [number, number, number];
  curlAngle: number; // radians, 0=straight, 1.5≈fully curled
  fingerName: string;
  hasError: boolean;
  isThumb?: boolean;
}

function Finger({ basePosition, curlAngle, fingerName, hasError, isThumb }: FingerProps) {
  const color = "#f5d0a9";
  const phalanxLen = isThumb ? 0.065 : 0.08;
  const radius = isThumb ? 0.022 : 0.018;

  const curl1 = curlAngle * 0.4;
  const curl2 = curlAngle * 0.35;
  const curl3 = curlAngle * 0.25;

  return (
    <group position={basePosition}>
      {/* Proximal phalanx */}
      <group rotation={[curl1, 0, 0]}>
        <FingerBone
          position={[0, phalanxLen / 2, 0]}
          rotation={[0, 0, 0]}
          length={phalanxLen}
          radius={radius}
          color={color}
          hasError={hasError}
        />
        {/* Middle phalanx */}
        <group position={[0, phalanxLen, 0]} rotation={[curl2, 0, 0]}>
          <FingerBone
            position={[0, phalanxLen / 2 * 0.85, 0]}
            rotation={[0, 0, 0]}
            length={phalanxLen * 0.85}
            radius={radius * 0.92}
            color={color}
            hasError={hasError}
          />
          {/* Distal phalanx */}
          <group position={[0, phalanxLen * 0.85, 0]} rotation={[curl3, 0, 0]}>
            <FingerBone
              position={[0, phalanxLen / 2 * 0.7, 0]}
              rotation={[0, 0, 0]}
              length={phalanxLen * 0.7}
              radius={radius * 0.82}
              color={color}
              hasError={hasError}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

interface HandMeshProps {
  sign: SignDefinition;
  errorFingers: string[];
  animated?: boolean;
}

function HandMesh({ sign, errorFingers, animated }: HandMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const errorSet = new Set(errorFingers);

  // Animate slow idle rotation
  useFrame((state) => {
    if (!groupRef.current || !animated) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
  });

  // Convert curl (0-1) to radian rotation for visual
  const curlToAngle = (curl: number) => curl * 1.4;

  const fingerDefs = [
    {
      name: "Thumb",
      basePos: [-0.09, 0.04, 0.01] as [number, number, number],
      isThumb: true,
    },
    {
      name: "Index",
      basePos: [-0.055, 0.14, 0] as [number, number, number],
      isThumb: false,
    },
    {
      name: "Middle",
      basePos: [-0.015, 0.15, 0] as [number, number, number],
      isThumb: false,
    },
    {
      name: "Ring",
      basePos: [0.025, 0.145, 0] as [number, number, number],
      isThumb: false,
    },
    {
      name: "Pinky",
      basePos: [0.063, 0.13, 0] as [number, number, number],
      isThumb: false,
    },
  ];

  return (
    <group ref={groupRef} rotation={[0.2, 0, 0]}>
      {/* Palm */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[0.18, 0.18, 0.04]} />
        <meshStandardMaterial color="#f5d0a9" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Wrist */}
      <mesh position={[0, -0.12, 0]} castShadow>
        <capsuleGeometry args={[0.045, 0.06, 6, 8]} />
        <meshStandardMaterial color="#f5c5a0" roughness={0.7} />
      </mesh>

      {fingerDefs.map((f, i) => (
        <Finger
          key={f.name}
          basePosition={f.basePos}
          curlAngle={curlToAngle(sign.targetCurls[i])}
          fingerName={f.name}
          hasError={errorSet.has(f.name)}
          isThumb={f.isThumb}
        />
      ))}
    </group>
  );
}

interface SignAvatar3DProps {
  sign: SignDefinition;
  errorFingers?: string[];
  animated?: boolean;
  className?: string;
}

export function SignAvatar3D({ sign, errorFingers = [], animated = true, className }: SignAvatar3DProps) {
  return (
    <div className={className ?? "w-full h-64"}>
      <Canvas
        camera={{ position: [0, 0.1, 0.65], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[2, 4, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
        />
        <pointLight position={[-2, 2, -1]} intensity={0.4} color="#a855f7" />

        <HandMesh sign={sign} errorFingers={errorFingers} animated={animated} />

        <OrbitControls
          enablePan={false}
          minDistance={0.3}
          maxDistance={1.2}
          target={[0, 0.05, 0]}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
