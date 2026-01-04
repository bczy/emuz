/**
 * Card Component
 * Container with consistent styling for content
 */

import React from 'react';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Clickable card */
  clickable?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
  /** Accessibility role */
  role?: string;
}

const paddingSizes: Record<NonNullable<CardProps['padding']>, number> = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 24,
};

const baseStyle: React.CSSProperties = {
  borderRadius: 12,
  overflow: 'hidden',
  transition: 'all 0.15s ease',
};

const variantStyles: Record<NonNullable<CardProps['variant']>, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--card-bg, #1E293B)',
    border: '1px solid var(--card-border, #334155)',
  },
  outlined: {
    backgroundColor: 'transparent',
    border: '1px solid var(--card-border, #334155)',
  },
  elevated: {
    backgroundColor: 'var(--card-bg, #1E293B)',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  clickable = false,
  selected = false,
  disabled = false,
  padding = 'md',
  onClick,
  className = '',
  style,
  testID,
  role,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  
  const computedStyle: React.CSSProperties = {
    ...baseStyle,
    ...variantStyles[variant],
    padding: paddingSizes[padding],
    ...(clickable && {
      cursor: 'pointer',
    }),
    ...(clickable && isHovered && !disabled && {
      borderColor: 'var(--card-hover-border, #10B981)',
      transform: 'translateY(-2px)',
    }),
    ...(clickable && isPressed && !disabled && {
      transform: 'translateY(0)',
    }),
    ...(selected && {
      borderColor: 'var(--color-primary, #10B981)',
      boxShadow: '0 0 0 2px var(--primary-ring, rgba(16, 185, 129, 0.3))',
    }),
    ...(disabled && {
      opacity: 0.5,
      cursor: 'not-allowed',
    }),
    ...style,
  };
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !clickable) return;
    onClick?.(e);
  };
  
  return (
    <div
      className={className}
      style={computedStyle}
      onClick={handleClick}
      role={role || (clickable ? 'button' : undefined)}
      tabIndex={clickable && !disabled ? 0 : undefined}
      aria-disabled={disabled}
      data-testid={testID}
      onMouseEnter={() => clickable && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => clickable && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {children}
    </div>
  );
};

Card.displayName = 'Card';

export default Card;
