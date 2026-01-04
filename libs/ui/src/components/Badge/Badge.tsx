/**
 * Badge Component
 * Small indicator for status, counts, or labels
 */

import React from 'react';

export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Badge variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Pill shape (fully rounded) */
  pill?: boolean;
  /** Dot style (no content, just a dot) */
  dot?: boolean;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--badge-default-bg, #334155)',
    color: 'var(--badge-default-text, #F1F5F9)',
    border: 'none',
  },
  primary: {
    backgroundColor: 'var(--color-primary, #10B981)',
    color: '#FFFFFF',
    border: 'none',
  },
  success: {
    backgroundColor: 'var(--color-success, #22C55E)',
    color: '#FFFFFF',
    border: 'none',
  },
  warning: {
    backgroundColor: 'var(--color-warning, #F59E0B)',
    color: '#000000',
    border: 'none',
  },
  error: {
    backgroundColor: 'var(--color-error, #EF4444)',
    color: '#FFFFFF',
    border: 'none',
  },
  info: {
    backgroundColor: 'var(--color-info, #3B82F6)',
    color: '#FFFFFF',
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary, #CBD5E1)',
    border: '1px solid var(--border, #475569)',
  },
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, React.CSSProperties> = {
  sm: {
    padding: '2px 6px',
    fontSize: 10,
    lineHeight: '14px',
    borderRadius: 4,
  },
  md: {
    padding: '3px 8px',
    fontSize: 12,
    lineHeight: '16px',
    borderRadius: 6,
  },
  lg: {
    padding: '4px 10px',
    fontSize: 14,
    lineHeight: '20px',
    borderRadius: 8,
  },
};

const dotSizes: Record<NonNullable<BadgeProps['size']>, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

const baseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pill = false,
  dot = false,
  className = '',
  style,
  testID,
}) => {
  if (dot) {
    const dotSize = dotSizes[size];
    const dotStyle: React.CSSProperties = {
      width: dotSize,
      height: dotSize,
      borderRadius: '50%',
      ...variantStyles[variant],
      padding: 0,
      ...style,
    };
    
    return <span className={className} style={dotStyle} data-testid={testID} />;
  }
  
  const computedStyle: React.CSSProperties = {
    ...baseStyle,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(pill && { borderRadius: 9999 }),
    ...style,
  };
  
  return (
    <span className={className} style={computedStyle} data-testid={testID}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;
