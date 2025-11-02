'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import GlobeComponent, { type LocationPoint, type ChatMessage as GlobeChatMessage } from '../components/Globe';
import Card, { CardHeader, CardTitle, CardBody } from '../components/core/Card';
import { TextPrimary, TextSecondary, GlassBorder, GlassHighlight } from '../assets/COLOURS';
import { getAccentByIndex } from '../utils/colourUtils';
import type {GetStationsResponseType} from "@shared/DTOs";
import { getTalkSession, type ConversationRef, type UserRef } from '@talkjs/core';

import Globe2Icon from '../assets/icons/globe-2.svg?react';
import LocationPinIcon from '../assets/icons/location-pin.svg?react';
import CompassIcon from '../assets/icons/compass.svg?react';
import StarIcon from '../assets/icons/star.svg?react';
import MagnifyingGlassIcon from '../assets/icons/magnifying-glass.svg?react';
import CommentIcon from '../assets/icons/comment.svg?react';
import PencilIcon from '../assets/icons/pencil.svg?react';

type ChatMessage = GlobeChatMessage;

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);
  const [playingLocation, setPlayingLocation] = useState<LocationPoint | null>(null);
  const [stations, setStations] = useState<LocationPoint[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [isChatEnabled, setIsChatEnabled] = useState<boolean>(true);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const conversationRef = React.useRef<ConversationRef | null>(null);
  const sessionRef = React.useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const seenMessageIds = React.useRef<Set<string>>(new Set());

  // Get user's geolocation on mount
  useEffect(() => {
    if (navigator.geolocation && isChatEnabled) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          localStorage.setItem('user_lat', latitude.toString());
          localStorage.setItem('user_lon', longitude.toString());
          console.log('User location:', latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to a default location if geolocation fails
          const defaultLat = 51.5074; // London
          const defaultLon = -0.1278;
          setUserLocation({ lat: defaultLat, lon: defaultLon });
          localStorage.setItem('user_lat', defaultLat.toString());
          localStorage.setItem('user_lon', defaultLon.toString());
        }
      );
    }
  }, [isChatEnabled]);

  const handleLocationClick = (location: LocationPoint) => {
    setSelectedLocation(location);
    console.log('Location clicked:', location);

    // Clear previous messages when switching stations
    setChatMessages([]);
    seenMessageIds.current.clear();

    if (isChatEnabled && userLocation) {
      const id = `${userLocation.lat}_${userLocation.lon}_${Date.now()}`;

      const session = getTalkSession({
        appId: 'tjEVyI9N',
        // @ts-ignore
        host: "durhack.talkjs.com",
        userId: id,
      });

      sessionRef.current = session;

      let user: UserRef = session.user(id);

      user.set({ 
        name: "user", 
        custom: { 
          lon: userLocation.lon.toString(), 
          lat: userLocation.lat.toString() 
        } 
      });

      const conversation: ConversationRef = session.conversation(location.id);

      conversation.createIfNotExists();

      conversationRef.current = conversation;
    }
  };

  const handleClosePanel = () => {
    setSelectedLocation(null);
  };

  const handlePlay = () => {
      if (!selectedLocation) return;

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('play', () => {});
        audioRef.current.removeEventListener('error', () => {});
        audioRef.current.removeEventListener('ended', () => {}); // remove old ended listener
        audioRef.current.src = '';
      }

      const createAudio = () => {
        const audio = new Audio(`${import.meta.env.VITE_BACKEND_URL}/radio?id=${selectedLocation.id}`);
        audio.autoplay = true;
        audioRef.current = audio;

        // Event listeners
        audio.addEventListener('play', () => {
          setIsPlaying(true);
          setPlayingLocation(selectedLocation);
        });

        audio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          if (audioRef.current === audio) {
            setIsPlaying(false);
            setPlayingLocation(null);
          }
        });

        // Re-open stream on end
        audio.addEventListener('ended', () => {
          createAudio(); // re-create the audio element to restart the stream
        });

        audio.play().catch(err => {
          console.error('Play failed:', err);
          if (audioRef.current === audio) {
            setIsPlaying(false);
            setPlayingLocation(null);
          }
        });
      };

      createAudio();
    };

  const handleStop = () => {
    if (audioRef.current) {
      // Remove event listeners before stopping to prevent error alerts
      audioRef.current.removeEventListener('play', () => {});
      audioRef.current.removeEventListener('error', () => {});
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
    setPlayingLocation(null);
    
    // Clear all chat messages when stopping
    setChatMessages([]);
    seenMessageIds.current.clear();
  };

  const handleMiniPlayerClick = () => {
    if (playingLocation) {
      setSelectedLocation(playingLocation);
    }
  };

  const handleSend = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/stations`);
      const data: GetStationsResponseType = res.data;
      console.log('API Response:', data);
      console.log('Number of stations:', data.length);
      
      const transformedStations: LocationPoint[] = data.map((station, index) => {
        console.log('Transforming station:', station);
        return {
          id: station.id.toString(),
          name: station.name,
          locationName: `${station.city}, ${station.country}`,
          description: station.description,
          lat: station.lat,
          lon: station.lon,
          color: getAccentByIndex(index)
        };
      });
      
      console.log('Transformed stations:', transformedStations);
      setStations(transformedStations);
      setIsLoading(false);
    }
    catch (e: any) {
      console.error('Error fetching stations:', e);
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/search?prompt=${encodeURIComponent(searchQuery)}`);
      console.log('Search response:', res.data);
      const stationId = res.data.toString();
      
      // Check if search failed
      if (stationId === '-1') {
        console.warn('Search failed - no station found');
        alert('No station found matching your search');
        return;
      }
      
      // Find the station with this ID
      const foundStation = stations.find(station => station.id === stationId);
      
      if (foundStation) {
        // Emulate user clicking on the location
        handleLocationClick(foundStation);
        setSearchQuery('');
        setIsSearchMode(false);
      } else {
        console.warn(`Station with id ${stationId} not found in local data`);
        alert('Station not found in current data');
      }
    } catch (e: any) {
      console.error('Error searching:', e);
      alert('Search failed - please try again');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !conversationRef.current || !sessionRef.current) return;

    try {
      conversationRef.current.send({
        text: chatMessage,
        custom: {
          lat: userLocation ? userLocation.lat.toString() : '0',
          lon: userLocation ? userLocation.lon.toString() : '0'
        }
      });
      
      console.log('Sent chat message:', chatMessage);
      setChatMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  useEffect(() => {
      handleSend();
  }, []);

  // Handle chat toggle when already playing - subscribe to messages if chat is turned on
  useEffect(() => {
    if (isChatEnabled && isPlaying && playingLocation && conversationRef.current && !seenMessageIds.current.size) {
      let isFirstLoad = true;
      
      conversationRef.current.subscribeMessages((messages) => {
        // Only process new messages we haven't seen
        if (messages && messages.length > 0) {
          // On first load, mark all existing messages as seen without displaying them
          if (isFirstLoad) {
            messages.forEach((msg: any) => {
              seenMessageIds.current.add(msg.id);
            });
            isFirstLoad = false;
            return;
          }
          
          messages.forEach((msg: any) => {
            if (seenMessageIds.current.has(msg.id)) return;
            
            seenMessageIds.current.add(msg.id);
            
            const senderLat = parseFloat(msg.custom?.lat || playingLocation.lat);
            const senderLon = parseFloat(msg.custom?.lon || playingLocation.lon);
            
            const newChatMessage: ChatMessage = {
              id: msg.id,
              text: msg.plaintext || '',
              lat: senderLat,
              lon: senderLon,
              timestamp: Date.now(),
              color: playingLocation.color || getAccentByIndex(0)
            };
            
            setChatMessages(prev => [...prev, newChatMessage]);
            
            setTimeout(() => {
              setChatMessages(prev => prev.filter(chatMsg => chatMsg.id !== msg.id));
            }, 5000);
          });
        }
      });
    }
  }, [isChatEnabled, isPlaying, playingLocation]);

  // Random message generator - sends 1 message every 3-5 seconds from random locations when playing
  useEffect(() => {
    if (!isChatEnabled || !conversationRef.current || !sessionRef.current || !isPlaying || !playingLocation) return;

    const sendRandomMessage = () => {
      if (conversationRef.current && sessionRef.current) {
        const interestingMessages = [            
              "Hello Durhack! 👋",
              "Durhack 2025 🚀",
              "Hacking away 💻",
              "Durham vibes ⚡",
              "Team Durhack! 🏆",
              "Coding is fun! 😄",
              "We love Durhack! ❤️",
              "Exploring cultures 🌍",
              "Sharing stories 📖",
              "Embracing traditions 🏺",
              "Learning 📚",
              "Celebrating diversity 🌈",
              "Building bridges 🌉",
              "Legacy FM rocks! 🎶",
              "Solaris the goat! 🐐"
            ];
        
        const randomMessage = interestingMessages[Math.floor(Math.random() * interestingMessages.length)];
        
        // Generate truly random coordinates
        const randomLat = (Math.random() * 180 - 90).toFixed(4);
        const randomLon = (Math.random() * 360 - 180).toFixed(4);
           
        // Send message as this random user
        conversationRef.current.send({
          text: randomMessage,
          custom: {
            lat: randomLat,
            lon: randomLon
          }
        });
      }

      // Schedule next message with random delay between 0.5-0.75 seconds
      const nextDelay = 500 + Math.random() * 250;
      timeoutId = setTimeout(sendRandomMessage, nextDelay);
    };

    let timeoutId = setTimeout(sendRandomMessage, 375); // Start after 375 milliseconds

    return () => clearTimeout(timeoutId);
  }, [isChatEnabled, isPlaying, playingLocation]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <PageContainer>
      <GlobeSection>
        <GlobeComponent 
          locations={stations}
          onLocationClick={handleLocationClick}
          selectedLocation={selectedLocation}
          chatMessages={chatMessages}
        />
      </GlobeSection>

      <Card position="top-left" minWidth="280px">
        {!isSearchMode ? (
          <HeaderContainer>
            <IconWrapper $color={getAccentByIndex(0)}>
              <Globe2Icon width={40} height={40} />
            </IconWrapper>
            <div style={{ flex: 1 }}>
              <HeaderTitle>Legacy FM</HeaderTitle>
              <HeaderSubtitle>Discover fading traditions, cultures, and stories</HeaderSubtitle>
            </div>
            <SearchToggleButton onClick={() => setIsSearchMode(true)}>
              <MagnifyingGlassIcon width={64} height={64} />
            </SearchToggleButton>
          </HeaderContainer>
        ) : (
          <SearchExpandedContainer>
            <SearchContainer>
              <IconWrapper $color={getAccentByIndex(3)}>
                <MagnifyingGlassIcon width={40} height={40} />
              </IconWrapper>
              <SearchFormContainer onSubmit={handleSearchSubmit}>
                <SearchInput
                  type="text"
                  placeholder="Search with AI ✨"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <SearchSubmitButton type="submit">
                  Search
                </SearchSubmitButton>
              </SearchFormContainer>
              <CloseSearchButton onClick={() => { setIsSearchMode(false); setSearchQuery(''); }}>
                ×
              </CloseSearchButton>
            </SearchContainer>
            
            <StationListContainer>
              <StationListHeader>All Stations ({stations.length})</StationListHeader>
              <StationList>
                {isLoading ? (
                  <LoadingMessage>Loading stations...</LoadingMessage>
                ) : stations.length === 0 ? (
                  <EmptyMessage>No stations available</EmptyMessage>
                ) : (
                  stations.map((station, index) => (
                    <StationItem
                      key={station.id}
                      onClick={() => {
                        handleLocationClick(station);
                        setIsSearchMode(false);
                        setSearchQuery('');
                      }}
                      $isSelected={selectedLocation?.id === station.id}
                    >
                      <IconWrapper $color={station.color || getAccentByIndex(index)}>
                        <LocationPinIcon width={20} height={20} />
                      </IconWrapper>
                      <StationInfo>
                        <StationName>{station.name}</StationName>
                        <StationLocation>{station.locationName}</StationLocation>
                      </StationInfo>
                    </StationItem>
                  ))
                )}
              </StationList>
            </StationListContainer>
          </SearchExpandedContainer>
        )}
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
            <LocationTitle>Location: {selectedLocation.locationName}</LocationTitle>
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
            
            <PlaySection>
              {isPlaying && playingLocation?.id === selectedLocation.id ? (
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
              ) : (
                <PlayButton onClick={handlePlay}>
                  <PlayIcon>▶</PlayIcon>
                  <span>Listen to Station</span>
                </PlayButton>
              )}
            </PlaySection>
          </CardBody>
        </Card>
      )}

      <Card position="bottom-left" minWidth="320px">
        <NavigationContainer>
          <CardTitle>Navigation Guide</CardTitle>
          <NavigationRow>
            <InstructionsList>
              <InstructionItem>
                <IconBadge $color={getAccentByIndex(0)}>
                  <CompassIcon width={24} height={24} />
                </IconBadge>
                <span>Drag to rotate the globe</span>
              </InstructionItem>
              <InstructionItem>
                <IconBadge $color={getAccentByIndex(2)}>
                  <LocationPinIcon width={24} height={24} />
                </IconBadge>
                <span>Click markers for details</span>
              </InstructionItem>
            </InstructionsList>
            
            <ButtonsRow>
              <ToggleButton 
                onClick={() => {
                  setIsChatEnabled(!isChatEnabled);
                }}
                $isActive={isChatEnabled}
              >
                <ToggleIconWrapper $color={getAccentByIndex(3)}>
                  <CommentIcon width={40} height={40} />
                  {!isChatEnabled && <StrikeThroughLine />}
                </ToggleIconWrapper>
              </ToggleButton>
            </ButtonsRow>
          </NavigationRow>
        </NavigationContainer>
      </Card>

      {/* Mini Player - shown when playing but not selected */}
      {isPlaying && playingLocation && playingLocation.id !== selectedLocation?.id && (
        <Card position="bottom-right" minWidth="320px">
          <MiniPlayerContainer onClick={handleMiniPlayerClick}>
            <MiniPlayerHeader>
              <IconWrapper $color={playingLocation.color || getAccentByIndex(0)}>
                <LocationPinIcon width={24} height={24} />
              </IconWrapper>
              <MiniPlayerTitle>{playingLocation.name},</MiniPlayerTitle><MiniPlayerSubtitle>{playingLocation.locationName}</MiniPlayerSubtitle>
            </MiniPlayerHeader>
            <LiveStreamIndicator>
              <LiveWaveAnimation $color={playingLocation.color || getAccentByIndex(0)}>
                <WaveBar style={{ animationDelay: '0s' }} />
                <WaveBar style={{ animationDelay: '0.1s' }} />
                <WaveBar style={{ animationDelay: '0.2s' }} />
                <WaveBar style={{ animationDelay: '0.3s' }} />
                <WaveBar style={{ animationDelay: '0.4s' }} />
              </LiveWaveAnimation>
              <PlaybackLabel>
                <LiveIndicator $color={playingLocation.color || getAccentByIndex(0)} />
                Streaming Live
              </PlaybackLabel>
            </LiveStreamIndicator>
          </MiniPlayerContainer>
        </Card>
      )}

      {/* Chat Input Box - shown when chat is enabled AND playing */}
      {isChatEnabled && selectedLocation && isPlaying && playingLocation?.id === selectedLocation.id && (
        <ChatCardContainer>
          <Card minWidth="400px" width="500px">
            <ChatForm onSubmit={handleChatSubmit}>
              <ChatFormContent>
                <ChatInput
                  type="text"
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <ChatSendButton type="submit">
                  <PencilIcon width={32} height={32} />
                </ChatSendButton>
              </ChatFormContent>
            </ChatForm>
          </Card>
        </ChatCardContainer>
      )}
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
  gap: 0.75rem;
  color: ${TextSecondary};
  font-size: 0.85rem;
  font-weight: 400;
`;

const NavigationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const NavigationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
`;

const InstructionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const IconBadge = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => `${props.$color}20`};
  border: 2px solid ${props => `${props.$color}40`};
  flex-shrink: 0;
  
  svg {
    fill: ${props => props.$color};
  }
`;

const ToggleButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  min-height: 64px;
  background: ${props => props.$isActive ? GlassHighlight : `${GlassHighlight}80`};
  border: 2px solid ${props => props.$isActive ? GlassBorder : `${GlassBorder}60`};
  border-radius: 8px;
  color: ${props => props.$isActive ? TextPrimary : TextSecondary};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${GlassHighlight};
    border-color: ${GlassBorder};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ToggleIconWrapper = styled.div<{ $color: string }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 8px;
  background: ${props => `${props.$color}20`};
  border: 2px solid ${props => `${props.$color}40`};
  flex-shrink: 0;
  
  svg {
    fill: ${props => props.$color};
  }
`;

const StrikeThroughLine = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 4px;
  background: #394240;
  border-radius: 2px;
  transform: translate(-50%, -50%) rotate(-45deg);
  pointer-events: none;
  z-index: 10;
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

const MiniPlayerContainer = styled.div`
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const MiniPlayerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const MiniPlayerTitle = styled.p`
  font-size: 1.1rem;
  color: ${TextPrimary};
  margin: 0;
  font-weight: 600;
  font-family: 'Segoe UI', system-ui, sans-serif;
`;

const MiniPlayerSubtitle = styled.p`
  font-size: 0.9rem;
  color: ${TextSecondary};
  margin: 0;
  font-weight: 600;
  font-family: 'Segoe UI', system-ui, sans-serif;
`;

const SearchToggleButton = styled.button`
  background: transparent;
  color: ${TextPrimary};
  border: none;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  svg {
    fill: ${getAccentByIndex(3)};
    transition: all 0.2s ease;
  }
  
  &:hover {    
    svg {
      fill: ${getAccentByIndex(0)};
      transform: scale(1.1);
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const SearchExpandedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 38px;
`;

const SearchFormContainer = styled.form`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const StationListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StationListHeader = styled.h3`
  font-size: 0.9rem;
  color: ${TextSecondary};
  margin: 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${GlassHighlight};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${GlassBorder};
    border-radius: 3px;
    
    &:hover {
      background: ${getAccentByIndex(3)};
    }
  }
`;

const StationItem = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${props => props.$isSelected ? `${getAccentByIndex(0)}20` : GlassHighlight};
  border: 2px solid ${props => props.$isSelected ? getAccentByIndex(0) : GlassBorder};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isSelected ? `${getAccentByIndex(0)}30` : `${getAccentByIndex(3)}15`};
    border-color: ${props => props.$isSelected ? getAccentByIndex(0) : getAccentByIndex(3)};
    transform: translateX(4px);
  }
  
  &:active {
    transform: translateX(2px);
  }
`;

const StationInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
`;

const StationName = styled.div`
  font-size: 1rem;
  color: ${TextPrimary};
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StationLocation = styled.div`
  font-size: 0.85rem;
  color: ${TextSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${TextSecondary};
  font-size: 0.95rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${TextSecondary};
  font-size: 0.95rem;
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  color: ${TextPrimary};
  font-size: 1rem;
  padding: 0.5rem 0;
  outline: none;
  flex: 1;
  font-family: 'Segoe UI', system-ui, sans-serif;
  
  &::placeholder {
    color: ${TextSecondary};
  }
`;

const SearchSubmitButton = styled.button`
  background: ${getAccentByIndex(3)};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  color: #1a1a2e;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-1px);
    background: ${getAccentByIndex(0)};
    color: ${TextPrimary};
    box-shadow: 0 4px 12px ${getAccentByIndex(3)}40;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CloseSearchButton = styled.button`
  background: ${GlassHighlight};
  border: 2px solid ${GlassBorder};
  color: ${TextSecondary};
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.8rem;
  font-weight: 300;
  padding: 20px;
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

const ChatCardContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
`;

const ChatForm = styled.form`
  width: 100%;
`;

const ChatFormContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ChatInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: ${TextPrimary};
  font-size: 1rem;
  padding: 0.5rem;
  outline: none;
  font-family: 'Segoe UI', system-ui, sans-serif;
  
  &::placeholder {
    color: ${TextSecondary};
  }
`;

const ChatSendButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    fill: ${TextPrimary};
    transition: all 0.2s ease;
  }
  
  &:hover svg {
    fill: ${getAccentByIndex(5)};
    transform: translateY(-2px);
  }
  
  &:active svg {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:disabled svg {
    transform: none;
  }
`;
