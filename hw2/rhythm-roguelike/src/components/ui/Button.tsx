import React, { useRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  enableSound?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  enableSound = true,
  onClick,
  onMouseEnter,
  ...props
}) => {
  const selectSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  React.useEffect(() => {
    if (enableSound) {
      selectSoundRef.current = new Audio('/src/assets/sound_effect/select-button.mp3');
      clickSoundRef.current = new Audio('/src/assets/sound_effect/click-button.mp3');
      
      // Set volume for sound effects
      if (selectSoundRef.current) {
        selectSoundRef.current.volume = 0.3;
      }
      if (clickSoundRef.current) {
        clickSoundRef.current.volume = 0.5;
      }
    }
  }, [enableSound]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Play click sound
    if (enableSound && clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0; // Reset to beginning
      clickSoundRef.current.play().catch(console.error);
    }
    
    // Call original onClick handler
    if (onClick) {
      onClick(event);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Play select sound
    if (enableSound && selectSoundRef.current) {
      selectSoundRef.current.currentTime = 0; // Reset to beginning
      selectSoundRef.current.play().catch(console.error);
    }
    
    // Call original onMouseEnter handler
    if (onMouseEnter) {
      onMouseEnter(event);
    }
  };

  const baseClasses = 'button';
  const variantClass = `button--${variant}`;
  const sizeClass = `button--${size}`;
  
  const combinedClasses = [
    baseClasses,
    variantClass,
    sizeClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={combinedClasses} 
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
