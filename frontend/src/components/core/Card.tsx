import styled from 'styled-components';
import { TextPrimary, TextSecondary, GlassBg, GlassBorder, GlassHighlight } from '../../assets/COLOURS';

interface CardProps {
  children: React.ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-right' | 'center-left';
  width?: string;
  minWidth?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  position,
  width,
  minWidth = '280px',
  className 
}) => {
  return (
    <StyledCard 
      $position={position}
      $width={width}
      $minWidth={minWidth}
      className={className}
    >
      {children}
    </StyledCard>
  );
};

const StyledCard = styled.div<{ $position?: string; $width?: string; $minWidth: string }>`
  background: ${GlassBg};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid ${GlassBorder};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 10;
  min-width: ${props => props.$minWidth};
  width: ${props => props.$width || 'auto'};
  
  ${props => {
    switch(props.$position) {
      case 'top-left':
        return `
          position: absolute;
          top: 2rem;
          left: 2rem;
          @media (max-width: 768px) {
            top: 1rem;
            left: 1rem;
            right: 1rem;
            min-width: auto;
          }
        `;
      case 'top-right':
        return `
          position: absolute;
          top: 2rem;
          right: 2rem;
          @media (max-width: 768px) {
            top: auto;
            bottom: 8rem;
            right: 1rem;
            left: 1rem;
            min-width: auto;
          }
        `;
      case 'bottom-left':
        return `
          position: absolute;
          bottom: 2rem;
          left: 2rem;
          @media (max-width: 768px) {
            display: none;
          }
        `;
      case 'bottom-right':
        return `
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          @media (max-width: 768px) {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
            min-width: auto;
          }
        `;
      case 'center-right':
        return `
          position: absolute;
          top: 2rem;
          right: 2rem;
          max-height: calc(100vh - 4rem);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @media (max-width: 1024px) {
            top: 1rem;
            right: 1rem;
            max-height: calc(100vh - 2rem);
          }
          
          @media (max-width: 768px) {
            right: 1rem;
            left: 1rem;
            width: auto;
            top: 1rem;
            bottom: auto;
            max-height: calc(100vh - 10rem);
          }
        `;
      case 'center-left':
        return `
          position: absolute;
          top: 2rem;
          left: calc(280px + 2rem + 1.5rem);
          
          @media (max-width: 768px) {
            left: 1rem;
            right: 1rem;
            top: 5rem;
            min-width: auto;
          }
        `;
      default:
        return '';
    }
  }}
`;

export const CardHeader = styled.div`
  background: ${GlassHighlight};
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid ${GlassBorder};
  margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  border-radius: 12px 12px 0 0;
`;

export const CardTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${TextPrimary};
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 1.2px;
`;

export const CardBody = styled.div`
  padding: 0.5rem 0;
  flex: 1;
  overflow-y: auto;
  
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
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${TextSecondary};
  }
`;

export const CardFooter = styled.div`
  background: ${GlassHighlight};
  padding: 1rem 2rem;
  color: ${TextSecondary};
  font-size: 0.8rem;
  text-align: center;
  border-top: 2px solid ${GlassBorder};
  margin: 1.5rem -1.5rem -1.5rem -1.5rem;
  border-radius: 0 0 12px 12px;
`;

export default Card;