'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import GlobeComponent, { type LocationPoint } from '../components/Globe';
import GlassButton from '../components/core/Button';
import { TextPrimary, TextSecondary, BrandPrimary, BrandSecondary, BrandTertiary, BrandQuaternary, accentPrimary, GlassBg, GlassBorder, GlassHighlight } from '../assets/COLOURS';
import type { TestRequestType, TestResponseType } from "@shared/DTOs";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);
  const [stringg, setStringg] = useState<string>("");
  const [numberr, setNumberr] = useState<number>(0);
  const [response, setResponse] = useState<string | null>(null);

  const handleLocationClick = (location: LocationPoint) => {
    setSelectedLocation(location);
    console.log('Location clicked:', location);
  };

  const handleClosePanel = () => {
    setSelectedLocation(null);
  };

  const handleSend = async (body: TestRequestType) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/test`, body);
      const data: TestResponseType = res.data;
      setResponse(data.message);
    }
    catch (e: any) {
      setResponse(e.response?.status + e.message);
    }
  };

  return (
    <PageContainer>
      <GlobeSection>
        <GlobeComponent onLocationClick={handleLocationClick} />
      </GlobeSection>

      <FloatingHeader>
        <HeaderTitle>🌍 World Explorer</HeaderTitle>
        <HeaderSubtitle>Discover locations across the globe</HeaderSubtitle>
      </FloatingHeader>

      <ApiTestCard>
        <CardTitle>API Test</CardTitle>
        <ApiInput 
          value={stringg}
          type="text"
          placeholder="Enter string"
          onChange={(e) => setStringg(e.target.value)}
        />
        <ApiInput 
          value={numberr}
          type="number"
          placeholder="Enter number"
          onChange={(e) => setNumberr(parseInt(e.target.value))}
        />
        <GlassButton
          onClick={() => handleSend({stringg: stringg, numberr: numberr})}
          fullWidth
        > 
          Send
        </GlassButton>
        {response && (
          <ApiResponse>{response}</ApiResponse>
        )}
      </ApiTestCard>

      {selectedLocation && (
        <LocationCard>
          <CardHeader>
            <LocationName>{selectedLocation.name}</LocationName>
            <CloseButton onClick={handleClosePanel}>×</CloseButton>
          </CardHeader>
          <CardBody>
            <DataRow>
              <DataLabel>Latitude</DataLabel>
              <DataValue>{selectedLocation.lat.toFixed(4)}°</DataValue>
            </DataRow>
            <DataRow>
              <DataLabel>Longitude</DataLabel>
              <DataValue>{selectedLocation.lon.toFixed(4)}°</DataValue>
            </DataRow>
            <DataRow>
              <DataLabel>Location ID</DataLabel>
              <DataValue>#{selectedLocation.id}</DataValue>
            </DataRow>
          </CardBody>
          <CardFooter>
            ✨ Explore more data about this location
          </CardFooter>
        </LocationCard>
      )}

      <InstructionsCard>
        <CardTitle>How to Explore</CardTitle>
        <InstructionItem>
          <Icon>🖱️</Icon>
          <span>Drag to rotate</span>
        </InstructionItem>
        <InstructionItem>
          <Icon>🔍</Icon>
          <span>Scroll to zoom</span>
        </InstructionItem>
        <InstructionItem>
          <Icon>📍</Icon>
          <span>Click points for info</span>
        </InstructionItem>
      </InstructionsCard>
    </PageContainer>
  );
}

// ...existing code... (keep all the styled components below)
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #0a0e0d;
  position: relative;
  overflow: hidden;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const GlobeSection = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const FloatingHeader = styled.div`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: ${GlassBg};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 1.5rem 2.5rem;
  border-radius: 12px;
  border: 2px solid ${GlassBorder};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 10;
  max-width: 400px;
  
  @media (max-width: 768px) {
    top: 1rem;
    left: 1rem;
    right: 1rem;
    max-width: none;
    padding: 1rem 1.5rem;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${TextPrimary};
  margin: 0;
  font-family: 'Segoe UI', system-ui, sans-serif;
`;

const HeaderSubtitle = styled.p`
  font-size: 0.85rem;
  color: ${TextSecondary};
  margin: 0.5rem 0 0 0;
  font-weight: 400;
`;

const ApiTestCard = styled.div`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: ${GlassBg};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid ${GlassBorder};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 10;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    top: auto;
    bottom: 8rem;
    right: 1rem;
    left: 1rem;
    min-width: auto;
  }
`;

const ApiInput = styled.input`
  background: ${GlassHighlight};
  border: 1px solid ${GlassBorder};
  border-radius: 8px;
  padding: 0.75rem;
  color: ${TextPrimary};
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: ${BrandPrimary};
    box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.1);
  }
  
  &::placeholder {
    color: ${TextSecondary};
  }
`;

const ApiResponse = styled.div`
  background: ${GlassHighlight};
  border: 1px solid ${GlassBorder};
  border-radius: 8px;
  padding: 0.75rem;
  color: ${TextPrimary};
  font-size: 0.85rem;
  word-break: break-word;
`;

const LocationCard = styled.div`
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  background: ${GlassBg};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 3px solid ${GlassBorder};
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  z-index: 10;
  width: 380px;
  overflow: hidden;
  animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  @keyframes slideInRight {
    from {
      transform: translateY(-50%) translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateY(-50%) translateX(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    right: 1rem;
    left: 1rem;
    width: auto;
    top: auto;
    bottom: 1rem;
    transform: none;
  }
`;

const CardHeader = styled.div`
  background: ${GlassHighlight};
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid ${GlassBorder};
`;

const LocationName = styled.h2`
  font-size: 1.4rem;
  color: ${TextPrimary};
  margin: 0;
  font-weight: 600;
  font-family: 'Segoe UI', system-ui, sans-serif;
`;

const CloseButton = styled.button`
  background: rgba(245, 166, 91, 0.2);
  border: 2px solid ${accentPrimary};
  color: ${accentPrimary};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.3rem;
  font-weight: bold;
  backdrop-filter: blur(8px);

  &:hover {
    background: ${accentPrimary};
    color: ${TextPrimary};
    transform: rotate(90deg);
  }
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 0;
  border-bottom: 1px solid ${GlassBorder};
  
  &:last-child {
    border-bottom: none;
  }
`;

const DataLabel = styled.span`
  color: ${TextSecondary};
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const DataValue = styled.span`
  color: ${TextPrimary};
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
`;

const CardFooter = styled.div`
  background: ${GlassHighlight};
  padding: 1rem 2rem;
  color: ${TextSecondary};
  font-size: 0.8rem;
  text-align: center;
  border-top: 2px solid ${GlassBorder};
`;

const InstructionsCard = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  background: ${GlassBg};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  border: 2px solid ${GlassBorder};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 10;
  min-width: 240px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const CardTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${TextPrimary};
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 1.2px;
`;

const InstructionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${TextSecondary};
  font-size: 0.85rem;
  margin: 0.65rem 0;
  font-weight: 400;
`;

const Icon = styled.span`
  font-size: 1.1rem;
`;