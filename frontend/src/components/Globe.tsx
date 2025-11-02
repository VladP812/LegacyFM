'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import { BrandPrimary, BrandSecondary, BrandTertiary, BrandQuaternary, accentApricot } from '../assets/COLOURS';
import { getAccentByIndex } from '../utils/colourUtils';

// Types
interface LocationPoint {
  id: string;
  name: string;
  locationName: string;
  description: string;
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
  isSelected: boolean;
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

const PointMarker: React.FC<PointMarkerProps> = ({ position, location, onClick, isHovered, onHover, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const currentColorRef = useRef(new THREE.Color(location.color || '#ffffff'));

  useFrame((state) => {
    if (meshRef.current) {
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      const targetScale = isSelected ? 1.5 : (isHovered ? 1.3 : pulseScale);
      meshRef.current.scale.setScalar(targetScale);
      meshRef.current.quaternion.copy(state.camera.quaternion);
    }

    if (glowRef.current && isSelected) {
      const glowPulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      glowRef.current.scale.setScalar(2.5 * glowPulse);
      glowRef.current.quaternion.copy(state.camera.quaternion);
    }

    const targetColor = new THREE.Color(location.color || '#ffffff');
    currentColorRef.current.lerp(targetColor, 0.1);
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
      {/* Glow effect for selected */}
      {isSelected && (
        <mesh ref={glowRef}>
          <circleGeometry args={[0.02, 32]} />
          <meshBasicMaterial
            color={location.color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* Main marker */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <circleGeometry args={[0.015, 32]} />
        <meshBasicMaterial
          color={currentColorRef.current}
          transparent
          opacity={isHovered ? 1 : 0.95}
          side={THREE.DoubleSide}
          depthTest={true}
          depthWrite={true}
        />
      </mesh>
    </group>
  );
};

// Stars component for background
const Stars: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();
  const initialCameraRotation = useRef(new THREE.Euler());

  React.useEffect(() => {
    initialCameraRotation.current.copy(camera.rotation);
  }, [camera]);

  const starGeometry = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const starCount = 800;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Create stars in a sphere around the scene
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      sizes[i] = Math.random() * 1.5 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geometry;
  }, []);

  useFrame(() => {
    if (starsRef.current) {
      // Parallax effect - stars move slower than camera rotation
      const deltaRotationX = (camera.rotation.x - initialCameraRotation.current.x) * 0.15;
      const deltaRotationY = (camera.rotation.y - initialCameraRotation.current.y) * 0.15;
      
      starsRef.current.rotation.x = deltaRotationX;
      starsRef.current.rotation.y = deltaRotationY;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry attach="geometry" {...starGeometry} />
      <pointsMaterial
        attach="material"
        color="#ffffff"
        size={0.2}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  );
};

// Globe component
const Globe: React.FC<{ 
  locations: LocationPoint[]; 
  onLocationClick?: (location: LocationPoint) => void;
  selectedLocation: LocationPoint | null;
}> = ({
  locations,
  onLocationClick,
  selectedLocation,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { camera } = useThree();
  
  const targetPosition = useRef(new THREE.Vector3());
  const targetDistance = useRef(2);
  const isAnimating = useRef(false);
  const animationProgress = useRef(0);
  const previousSelectedId = useRef<string | null>(null);

  const texture = useLoader(THREE.TextureLoader, '/mapLight2.jpg');

  const handleLocationClick = (location: LocationPoint) => {
    onLocationClick?.(location);
  };

  // Trigger animation when selectedLocation changes
  React.useEffect(() => {
    if (selectedLocation && selectedLocation.id !== previousSelectedId.current) {
      const pointPosition = latLonToVector3(selectedLocation.lat, selectedLocation.lon, 1);
      targetPosition.current = pointPosition.clone().normalize().multiplyScalar(targetDistance.current);
      isAnimating.current = true;
      animationProgress.current = 0;
      previousSelectedId.current = selectedLocation.id;
    }
  }, [selectedLocation]);

  useFrame(() => {
    if (isAnimating.current && controlsRef.current) {
      animationProgress.current += 0.012;
      
      if (animationProgress.current >= 1) {
        animationProgress.current = 1;
        isAnimating.current = false;
      }

      const ease = 1 - Math.pow(1 - animationProgress.current, 3);
      camera.position.lerp(targetPosition.current, ease * 0.06);
      
      if (controlsRef.current.target) {
        controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), ease * 0.06);
      }
      
      controlsRef.current.update();
    }
  });

  return (
    <>
      <Stars />
      
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

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
              isSelected={selectedLocation?.id === location.id}
            />
          );
        })}
      </group>

      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} />
      <hemisphereLight args={['#ffffff', '#444444', 0.6]} />
      
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        minDistance={1.5}
        maxDistance={4}
      />
    </>
  );
};

export interface GlobeComponentProps {
  locations?: LocationPoint[];
  onLocationClick?: (location: LocationPoint) => void;
  selectedLocation?: LocationPoint | null;
}

const GlobeComponent: React.FC<GlobeComponentProps> = ({ 
  locations = [], 
  onLocationClick,
  selectedLocation = null 
}) => {
  const defaultLocations: LocationPoint[] = [
    { id: '1', name: 'A', locationName: 'New York, USA', description: 'The Big Apple', lat: 40.7128, lon: -74.006, color: getAccentByIndex(0) },
    { id: '2', name: 'B', locationName: 'London, UK', description: 'Historic British capital', lat: 51.5074, lon: -0.1278, color: getAccentByIndex(1) },
    { id: '3', name: 'C', locationName: 'Tokyo, Japan', description: 'Modern metropolis', lat: 35.6762, lon: 139.6503, color: getAccentByIndex(2) },
    { id: '4', name: 'D', locationName: 'Sydney, Australia', description: 'Harbor city', lat: -33.8688, lon: 151.2093, color: getAccentByIndex(3) },
    { id: '5', name: 'E', locationName: 'Paris, France', description: 'City of Light', lat: 48.8566, lon: 2.3522, color: getAccentByIndex(4) },
    { id: '6', name: 'F', locationName: 'Rio de Janeiro, Brazil', description: 'Carnival city', lat: -22.9068, lon: -43.1729, color: getAccentByIndex(5) },
    { id: '7', name: 'G', locationName: 'Dubai, UAE', description: 'Desert oasis', lat: 25.2048, lon: 55.2708, color: getAccentByIndex(6) },
    { id: '8', name: 'H', locationName: 'Singapore', description: 'Garden city', lat: 1.3521, lon: 103.8198, color: getAccentByIndex(0) },
    { id: '9', name: 'I', locationName: 'Moscow, Russia', description: 'Red Square', lat: 55.7558, lon: 37.6173, color: getAccentByIndex(1) },
    { id: '10', name: 'J', locationName: 'Cape Town, South Africa', description: 'Table Mountain', lat: -33.9249, lon: 18.4241, color: getAccentByIndex(2) },
  ];

  const pointsToRender = locations.length > 0 ? locations : defaultLocations;

  return (
    <GlobeContainer>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
        <Globe 
          locations={pointsToRender} 
          onLocationClick={onLocationClick}
          selectedLocation={selectedLocation}
        />
      </Canvas>
      <FloatingOrbs>
        <Orb $color={BrandPrimary} style={{ top: '10%', left: '5%', animationDelay: '0s' }} />
        <Orb $color={BrandSecondary} style={{ top: '70%', left: '15%', animationDelay: '2s' }} />
        <Orb $color={BrandTertiary} style={{ top: '30%', right: '10%', animationDelay: '4s' }} />
        <Orb $color={BrandQuaternary} style={{ bottom: '15%', right: '20%', animationDelay: '1s' }} />
      </FloatingOrbs>
    </GlobeContainer>
  );
};

export default GlobeComponent;
export type { LocationPoint };

import { accentFountain } from '../assets/COLOURS';

const GlobeContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: radial-gradient(ellipse at center, ${accentApricot}05 0%, ${accentFountain}03 1%, #000000 100%);
  // background: black;
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

const Orb = styled.div<{ $color: string }>`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, ${props => props.$color}25 0%, transparent 70%);
  filter: blur(80px);
  animation: float 15s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% {
      transform: translate(0, 0) scale(1);
      opacity: 0.3;
    }
    50% {
      transform: translate(30px, -30px) scale(1.2);
      opacity: 0.5;
    }
  }
`;