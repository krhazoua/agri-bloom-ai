import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface GlobeProps {
  stationLocation?: { lat: number; lng: number };
}

const Earth: React.FC<{ stationLocation?: { lat: number; lng: number } }> = ({ stationLocation }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const stationRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
    if (stationRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.2;
      stationRef.current.scale.setScalar(scale);
    }
  });

  const stationPosition = useMemo(() => {
    if (!stationLocation) return null;
    const phi = (90 - stationLocation.lat) * (Math.PI / 180);
    const theta = (stationLocation.lng + 180) * (Math.PI / 180);
    const radius = 2.05;
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, [stationLocation]);

  // Create gradient material for the globe
  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 atmosphere = vec3(0.0, 1.0, 0.8) * intensity;
          
          // Earth colors based on position
          vec3 ocean = vec3(0.04, 0.14, 0.45);
          vec3 land = vec3(0.15, 0.4, 0.25);
          
          float noise = fract(sin(dot(vPosition.xy, vec2(12.9898, 78.233))) * 43758.5453);
          vec3 baseColor = mix(ocean, land, noise * 0.5 + 0.25);
          
          gl_FragColor = vec4(baseColor + atmosphere * 0.5, 1.0);
        }
      `,
    });
  }, []);

  return (
    <group>
      {/* Main Earth sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>

      {/* Atmosphere glow */}
      <Sphere args={[2.1, 64, 64]}>
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.1} side={THREE.BackSide} />
      </Sphere>

      {/* Station marker */}
      {stationPosition && (
        <mesh ref={stationRef} position={stationPosition}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#00ffcc" />
        </mesh>
      )}

      {/* Grid lines */}
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[2.02, 32, 32]} />
        <meshBasicMaterial color="#00ffcc" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
};

export const InteractiveGlobe: React.FC<GlobeProps> = ({ stationLocation }) => {
  return (
    <div className="globe-container h-[400px] w-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        <Earth stationLocation={stationLocation} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={4}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
