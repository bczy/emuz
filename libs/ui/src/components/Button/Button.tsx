/**
 * Button Component
 * Reusable button with multiple variants and sizes
 */

import React from 'react';

export interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width button */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon on the left */
  leftIcon?: React.ReactNode;
  /** Icon on the right */
  rightIcon?: React.ReactNode;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
  /** Accessibility label */
  'aria-label'?: string;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--button-primary-bg, #10B981)',
    color: 'var(--button-primary-text, #FFFFFF)',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--button-secondary-bg, #334155)',
    color: 'var(--button-secondary-text, #F1F5F9)',
    border: '1px solid var(--button-secondary-border, #475569)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--button-ghost-text, #CBD5E1)',
    border: 'none',
  },
  danger: {
    backgroundColor: 'var(--button-danger-bg, #EF4444)',
    color: '#FFFFFF',
    border: 'none',
  },
};

const hoverStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--button-primary-hover, #34D399)',
  },
  secondary: {
    backgroundColor: 'var(--button-secondary-hover, #475569)',
  },
  ghost: {
    backgroundColor: 'var(--button-ghost-hover, #1E293B)',
  },
  danger: {
    backgroundColor: '#DC2626',
  },
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
  sm: {
    padding: '6px 12px',
    fontSize: 14,
    borderRadius: 6,
    minHeight: 32,
  },
  md: {
    padding: '10px 16px',
    fontSize: 16,
    borderRadius: 8,
    minHeight: 40,
  },
  lg: {
    padding: '14px 24px',
    fontSize: 18,
    borderRadius: 10,
    minHeight: 48,
  },
};

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  userSelect: 'none',
  outline: 'none',
  position: 'relative',
  overflow: 'hidden',
};

const disabledStyle: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  style,
  testID,
  'aria-label': ariaLabel,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  
  const computedStyle: React.CSSProperties = {
    ...baseStyle,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(isHovered && !disabled && hoverStyles[variant]),
    ...(isPressed && !disabled && { transform: 'scale(0.98)' }),
    ...(fullWidth && { width: '100%' }),
    ...(disabled && disabledStyle),
    ...style,
  };
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    onClick?.(e);
  };
  
  const LoadingSpinner = () => (
    <svg
      width={size === 'sm' ? 14 : size === 'md' ? 16 : 20}
      height={size === 'sm' ? 14 : size === 'md' ? 16 : 20}
      viewBox="0 0 24 24"
      style={{
        animation: 'spin 1s linear infinite',
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeDasharray="32"
        strokeLinecap="round"
      />
      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
    </svg>
  );
  
  return (
    <button
      type={type}
      className={className}
      style={computedStyle}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      data-testid={testID}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {leftIcon && <span style={{ display: 'flex' }}>{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span style={{ display: 'flex' }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

Button.displayName = 'Button';

export default Button;
