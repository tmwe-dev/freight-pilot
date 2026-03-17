import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Line } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

interface Location {
  lat: number;
  lng: number;
  label: string;
  isHQ?: boolean;
}

interface Route {
  from: [number, number];
  to: [number, number];
}

interface PartnerGlobeProps {
  locations: Location[];
  routes?: Route[];
  size?: number;
}

// Helper function to convert lat/lng to 3D coordinates on a sphere
const latLngToVector = (lat: number, lng: number, radius: number = 1) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
};

// Globe mesh component
function GlobeMesh({ locations, routes }: { locations: Location[]; routes?: Route[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovering, setIsHovering] = useState(false);

  useFrame(() => {
    if (groupRef.current && !isHovering) {
      groupRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
    >
      {/* Base sphere with grid */}
      <Sphere args={[1, 64, 64]}>
        <meshPhongMaterial
          color="#1a1a2e"
          wireframe={false}
          emissive="#0a0a1a"
          shininess={30}
        />
      </Sphere>

      {/* Grid lines on sphere */}
      <gridHelper args={[2, 12]} position={[0, 0, 0]} />

      {/* Route lines between locations */}
      {routes &&
        routes.map((route, idx) => {
          const fromPos = latLngToVector(route.from[0], route.from[1], 1.02);
          const toPos = latLngToVector(route.to[0], route.to[1], 1.02);

          return (
            <Line
              key={`route-${idx}`}
              points={[fromPos.toArray(), toPos.toArray()]}
              color="#64b5f6"
              lineWidth={1}
              transparent
              opacity={0.4}
              dashed={true}
              dashScale={10}
              gapSize={3}
            />
          );
        })}

      {/* Location dots */}
      {locations.map((location, idx) => {
        const position = latLngToVector(location.lat, location.lng, 1.05);
        const isHQ = location.isHQ;

        return (
          <group key={`location-${idx}`} position={[position.x, position.y, position.z]}>
            {/* Glowing dot */}
            <pointLight
              intensity={isHQ ? 2 : 1}
              distance={3}
              color={isHQ ? "#ff6b6b" : "#64b5f6"}
            />

            {/* Main sphere for dot */}
            <Sphere args={[isHQ ? 0.04 : 0.025, 16, 16]}>
              <meshStandardMaterial
                color={isHQ ? "#ff6b6b" : "#64b5f6"}
                emissive={isHQ ? "#ff3333" : "#3399ff"}
                emissiveIntensity={1.5}
                toneMapped={false}
              />
            </Sphere>

            {/* Halo effect for HQ */}
            {isHQ && (
              <Sphere args={[0.08, 16, 16]}>
                <meshStandardMaterial
                  color="#ff6b6b"
                  emissive="#ff6b6b"
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.3}
                  toneMapped={false}
                />
              </Sphere>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Main PartnerGlobe component
export default function PartnerGlobe({
  locations,
  routes = [],
  size = 400,
}: PartnerGlobeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full"
      style={{ height: `${size}px` }}
    >
      <Canvas
        camera={{
          position: [0, 0, 2.5],
          fov: 75,
        }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "12px",
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />

        <GlobeMesh locations={locations} routes={routes} />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className="w-2 h-2 rounded-full bg-[#64b5f6]" />
          <span>Office Location</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className="w-2 h-2 rounded-full bg-[#ff6b6b]" />
          <span>HQ</span>
        </div>
      </div>
    </motion.div>
  );
}
