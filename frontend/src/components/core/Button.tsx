import styled from 'styled-components';
import { TextPrimary, BrandPrimary, BrandSecondary } from '../../assets/COLOURS';

interface GlassButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  fullWidth?: boolean;
  disabled?: boolean;
}

const GlassButton: React.FC<GlassButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary',
  fullWidth = false,
  disabled = false 
}) => {
  return (
    <StyledButton 
      onClick={onClick} 
      $variant={variant}
      $fullWidth={fullWidth}
      disabled={disabled}
    >
      {children}
    </StyledButton>
  );
};

const StyledButton = styled.button<{ $variant: string; $fullWidth: boolean }>`
  background: ${props => {
    switch(props.$variant) {
      case 'secondary': return BrandSecondary;
      case 'accent': return '#ffd166';
      default: return BrandPrimary;
    }
  }};
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: ${TextPrimary};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  
  &:hover:not(:disabled) {
    background: ${props => {
      switch(props.$variant) {
        case 'secondary': return '#00d2a0';
        case 'accent': return '#ffbe4d';
        default: return BrandSecondary;
      }
    }};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default GlassButton;