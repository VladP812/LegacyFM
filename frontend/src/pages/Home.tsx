'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import GlobeComponent, { type LocationPoint } from '../components/Globe';
import Card, { CardHeader, CardTitle, CardBody } from '../components/core/Card';
import { TextPrimary, TextSecondary, GlassBorder, GlassHighlight } from '../assets/COLOURS';
import { getAccentByIndex } from '../utils/colourUtils';
import type { TestRequestType, TestResponseType } from "@shared/DTOs";

import Globe2Icon from '../assets/icons/globe-2.svg?react';
import LocationPinIcon from '../assets/icons/location-pin.svg?react';
import CompassIcon from '../assets/icons/compass.svg?react';
import MapIcon from '../assets/icons/map.svg?react';
import StarIcon from '../assets/icons/star.svg?react';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleLocationClick = (location: LocationPoint) => {
    setSelectedLocation(location);
    console.log('Location clicked:', location);
  };

  const handleClosePanel = () => {
    setSelectedLocation(null);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    alert('Play event triggered! Starting playback...');
    setIsPlaying(true);
  };

  const handleStop = () => {
    alert('Stop event triggered! Stopping playback...');
    setIsPlaying(false);
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
        <GlobeComponent 
          onLocationClick={handleLocationClick}
          selectedLocation={selectedLocation}
        />
      </GlobeSection>

      <Card position="top-left" minWidth="280px">
        <HeaderContainer>
          <IconWrapper $color={getAccentByIndex(0)}>
            <Globe2Icon width={40} height={40} />
          </IconWrapper>
          <div>
            <HeaderTitle>Legacy FM</HeaderTitle>
            <HeaderSubtitle>Discover dying traditions, cultures, and stories</HeaderSubtitle>
          </div>
        </HeaderContainer>
      </Card>

      {selectedLocation && (
        <Card position="center-right" width="400px">
          <CardHeader>
            <LocationHeader>
              <IconWrapper $color={selectedLocation.color || getAccentByIndex(3)}>
                <LocationPinIcon width={28} height={28} />
              </IconWrapper>
              <LocationName>{selectedLocation.name}</LocationName>
            </LocationHeader>
            <CloseButton onClick={handleClosePanel}>×</CloseButton>
          </CardHeader>
          <CardBody>
            <LocationTitle>{selectedLocation.locationName}</LocationTitle>
            <LocationDescription>{selectedLocation.description}</LocationDescription>
            
            <Divider />
            
            <DataRow>
              <DataLabel>
                <CompassIcon width={20} height={20} />
                <span>Coordinates</span>
              </DataLabel>
              <CoordinatesGroup>
                <DataValue $color={getAccentByIndex(1)}>{selectedLocation.lat.toFixed(4)}°</DataValue>
                <DataValue $color={getAccentByIndex(2)}>{selectedLocation.lon.toFixed(4)}°</DataValue>
              </CoordinatesGroup>
            </DataRow>
            <DataRow>
              <DataLabel>
                <StarIcon width={20} height={20} />
                <span>Location ID</span>
              </DataLabel>
              <DataValue $color={getAccentByIndex(4)}>#{selectedLocation.id}</DataValue>
            </DataRow>
            
            <Divider />
            
            <PlaySection>
              {!isPlaying ? (
                <PlayButton onClick={handlePlay}>
                  <PlayIcon>▶</PlayIcon>
                  <span>Listen to Station</span>
                </PlayButton>
              ) : (
                <>
                  <StopButton onClick={handleStop}>
                    <StopIcon>■</StopIcon>
                    <span>Stop</span>
                  </StopButton>
                  <LiveStreamIndicator>
                    <LiveWaveAnimation $color={selectedLocation.color || getAccentByIndex(0)}>
                      <WaveBar style={{ animationDelay: '0s' }} />
                      <WaveBar style={{ animationDelay: '0.1s' }} />
                      <WaveBar style={{ animationDelay: '0.2s' }} />
                      <WaveBar style={{ animationDelay: '0.3s' }} />
                      <WaveBar style={{ animationDelay: '0.4s' }} />
                    </LiveWaveAnimation>
                    <PlaybackLabel>
                      <LiveIndicator $color={selectedLocation.color || getAccentByIndex(0)} />
                      Streaming Live
                    </PlaybackLabel>
                  </LiveStreamIndicator>
                </>
              )}
            </PlaySection>
          </CardBody>
        </Card>
      )}

      <Card position="bottom-left" minWidth="260px">
        <CardTitle>Navigation Guide</CardTitle>
        <InstructionItem>
          <IconBadge $color={getAccentByIndex(0)}>
            <CompassIcon width={24} height={24} />
          </IconBadge>
          <span>Drag to rotate the globe</span>
        </InstructionItem>
        <InstructionItem>
          <IconBadge $color={getAccentByIndex(1)}>
            <MapIcon width={24} height={24} />
          </IconBadge>
          <span>Scroll to zoom in/out</span>
        </InstructionItem>
        <InstructionItem>
          <IconBadge $color={getAccentByIndex(2)}>
            <LocationPinIcon width={24} height={24} />
          </IconBadge>
          <span>Click markers for details</span>
        </InstructionItem>
      </Card>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  
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

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconWrapper = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => `${props.$color}20`};
  border: 2px solid ${props => `${props.$color}40`};
  flex-shrink: 0;
  
  svg {
    fill: ${props => props.$color};
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
  margin: 0.25rem 0 0 0;
  font-weight: 400;
`;

const LocationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LocationName = styled.h2`
  font-size: 1.4rem;
  color: ${TextPrimary};
  margin: 0;
  font-weight: 600;
  font-family: 'Segoe UI', system-ui, sans-serif;
`;

const CloseButton = styled.button`
  background: ${GlassHighlight};
  border: 2px solid ${GlassBorder};
  color: ${TextSecondary};
  min-width: 36px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.8rem;
  font-weight: 300;
  padding: 0;
  flex-shrink: 0;
  line-height: 0.8;
  font-family: Arial, sans-serif;

  &:hover {
    background: ${getAccentByIndex(0)};
    border-color: ${getAccentByIndex(0)};
    color: ${TextPrimary};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${GlassBorder};
  
  &:last-child {
    border-bottom: none;
  }
`;

const DataLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${TextSecondary};
  font-size: 0.85rem;
  font-weight: 500;
  
  svg {
    fill: ${TextSecondary};
  }
`;

const DataValue = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
`;

const CoordinatesGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const InstructionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${TextSecondary};
  font-size: 0.9rem;
  margin: 1rem 0;
  font-weight: 400;
`;

const IconBadge = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: ${props => `${props.$color}20`};
  border: 2px solid ${props => `${props.$color}40`};
  flex-shrink: 0;
  
  svg {
    fill: ${props => props.$color};
  }
`;

const LocationTitle = styled.h3`
  font-size: 1.2rem;
  color: ${TextPrimary};
  margin: 0 0 0.5rem 0;
  font-weight: 500;
`;

const LocationDescription = styled.p`
  font-size: 0.95rem;
  color: ${TextSecondary};
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${GlassBorder};
  margin: 1.5rem 0;
`;

const PlaySection = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  padding: 1.5rem 2rem;
  background: ${getAccentByIndex(0)};
  border: 2px solid ${getAccentByIndex(0)};
  border-radius: 12px;
  color: ${TextPrimary};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${getAccentByIndex(0)}40;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const PlayIcon = styled.div`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
`;

const StopButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  padding: 1.5rem 2rem;
  background: ${GlassHighlight};
  border: 2px solid ${getAccentByIndex(0)};
  border-radius: 12px;
  color: ${TextPrimary};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${getAccentByIndex(0)}20;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const StopIcon = styled.div`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
`;

const LiveStreamIndicator = styled.div`
  background: ${GlassHighlight};
  border: 2px solid ${GlassBorder};
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const LiveWaveAnimation = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 3px;
  height: 28px;
`;

const WaveBar = styled.div`
  width: 3px;
  height: 100%;
  background: ${getAccentByIndex(0)};
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
  
  @keyframes wave {
    0%, 100% {
      height: 20%;
    }
    50% {
      height: 100%;
    }
  }
`;

const PlaybackLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
  color: ${TextPrimary};
  font-weight: 600;
  font-size: 0.95rem;
`;

const LiveIndicator = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
  }
`;