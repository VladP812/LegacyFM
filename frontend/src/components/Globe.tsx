'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import { TextPrimary, TextSecondary, BrandPrimary, BrandSecondary, BrandTertiary, BrandQuaternary, accentPrimary, GlassBg, GlassBorder } from '../assets/COLOURS';

// Types
interface LocationPoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  color?: string;
}

interface PointMarkerProps {
  position: THREE.Vector3;
  location: LocationPoint;
  onClick: (location: LocationPoint) => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}

// Convert lat/lon to 3D coordinates on a sphere
const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

// Point marker component
const PointMarker: React.FC<PointMarkerProps> = ({ position, location, onClick, isHovered, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(1);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing animation
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      meshRef.current.scale.setScalar(isHovered ? 1.3 : pulseScale * scale);
      
      // Make the marker always face the camera
      meshRef.current.lookAt(state.camera.position);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick(location);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    onHover(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <circleGeometry args={[0.015, 32]} />
        <meshBasicMaterial
          color={accentPrimary}
          transparent
          opacity={isHovered ? 1 : 0.9}
        />
      </mesh>
    </group>
  );
};

// Globe component
const Globe: React.FC<{ locations: LocationPoint[]; onLocationClick?: (location: LocationPoint) => void }> = ({
  locations,
  onLocationClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Load the Earth texture
  const texture = useLoader(THREE.TextureLoader, '/map.jpg');

  const handleLocationClick = (location: LocationPoint) => {
    console.log('Clicked location:', location);
    onLocationClick?.(location);
  };

  return (
    <>
      {/* Wrap globe and points in a group so they rotate together */}
      <group ref={groupRef}>
        {/* Main globe */}
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Location points */}
        {locations.map((location) => {
          const position = latLonToVector3(location.lat, location.lon, 1.01);
          return (
            <PointMarker
              key={location.id}
              position={position}
              location={location}
              onClick={handleLocationClick}
              isHovered={hoveredId === location.id}
              onHover={(hovered) => setHoveredId(hovered ? location.id : null)}
            />
          );
        })}
      </group>

      {/* Improved Lighting */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} />
      <hemisphereLight args={['#ffffff', '#444444', 0.6]} />
    </>
  );
};

// Main exported component
export interface GlobeComponentProps {
  locations?: LocationPoint[];
  onLocationClick?: (location: LocationPoint) => void;
}

const GlobeComponent: React.FC<GlobeComponentProps> = ({ locations = [], onLocationClick }) => {
  // Default sample locations if none provided
  const defaultLocations: LocationPoint[] = [
    { id: '1', name: 'New York', lat: 40.7128, lon: -74.006, color: accentPrimary },
    { id: '2', name: 'London', lat: 51.5074, lon: -0.1278, color: BrandSecondary },
    { id: '3', name: 'Tokyo', lat: 35.6762, lon: 139.6503, color: BrandTertiary },
    { id: '4', name: 'Sydney', lat: -33.8688, lon: 151.2093, color: accentPrimary },
    { id: '5', name: 'Paris', lat: 48.8566, lon: 2.3522, color: BrandPrimary },
    { id: '6', name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, color: BrandSecondary },
    { id: '7', name: 'Dubai', lat: 25.2048, lon: 55.2708, color: BrandQuaternary },
    { id: '8', name: 'Singapore', lat: 1.3521, lon: 103.8198, color: accentPrimary },
    { id: '9', name: 'Moscow', lat: 55.7558, lon: 37.6173, color: BrandTertiary },
    { id: '10', name: 'Cape Town', lat: -33.9249, lon: 18.4241, color: BrandSecondary },
  ];

  const pointsToRender = locations.length > 0 ? locations : defaultLocations;

  return (
    <GlobeContainer>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
        <Globe locations={pointsToRender} onLocationClick={onLocationClick} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1.5}
          maxDistance={4}
        />
      </Canvas>
      <FloatingOrbs>
        <Orb style={{ top: '10%', left: '5%', animationDelay: '0s' }} />
        <Orb style={{ top: '70%', left: '15%', animationDelay: '2s' }} />
        <Orb style={{ top: '30%', right: '10%', animationDelay: '4s' }} />
        <Orb style={{ bottom: '15%', right: '20%', animationDelay: '1s' }} />
      </FloatingOrbs>
    </GlobeContainer>
  );
};

export default GlobeComponent;
export type { LocationPoint };


const GlobeContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: #0a0e0d;
  position: relative;
  overflow: hidden;
`;

const FloatingOrbs = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

const Orb = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, ${BrandPrimary}20 0%, transparent 70%);
  filter: blur(60px);
  animation: float 12s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) scale(1);
      opacity: 0.2;
    }
    50% {
      transform: translate(20px, -20px) scale(1.1);
      opacity: 0.4;
    }
  }
`;