/**
 * Icon Component
 * Wrapper for SVG icons with consistent sizing and colors
 */

import React from 'react';

export interface IconProps {
  /** Icon SVG or component */
  children?: React.ReactNode;
  /** Icon name (for icon libraries) */
  name?: string;
  /** Icon size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  /** Icon color */
  color?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'accent' | 'error' | 'success' | 'warning' | 'inherit';
  /** Rotate icon (degrees) */
  rotate?: number;
  /** Flip icon */
  flip?: 'horizontal' | 'vertical' | 'both';
  /** Spin animation */
  spin?: boolean;
  /** Pulse animation */
  pulse?: boolean;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
  /** Accessibility label */
  'aria-label'?: string;
  /** Hide from screen readers */
  'aria-hidden'?: boolean;
}

const sizeMap: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

const colorMap: Record<NonNullable<Exclude<IconProps['color'], 'inherit'>>, string> = {
  primary: 'var(--text-primary, #F8FAFC)',
  secondary: 'var(--text-secondary, #CBD5E1)',
  tertiary: 'var(--text-tertiary, #94A3B8)',
  muted: 'var(--text-muted, #64748B)',
  accent: 'var(--color-primary, #10B981)',
  error: 'var(--color-error, #EF4444)',
  success: 'var(--color-success, #22C55E)',
  warning: 'var(--color-warning, #F59E0B)',
};

export const Icon: React.FC<IconProps> = ({
  children,
  name,
  size = 'md',
  color = 'primary',
  rotate,
  flip,
  spin = false,
  pulse = false,
  className = '',
  style,
  testID,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}) => {
  const pixelSize = typeof size === 'number' ? size : sizeMap[size];
  const iconColor = color === 'inherit' ? 'inherit' : colorMap[color];
  
  const transforms: string[] = [];
  if (rotate) transforms.push(`rotate(${rotate}deg)`);
  if (flip === 'horizontal' || flip === 'both') transforms.push('scaleX(-1)');
  if (flip === 'vertical' || flip === 'both') transforms.push('scaleY(-1)');
  
  const animations: string[] = [];
  if (spin) animations.push('icon-spin 1s linear infinite');
  if (pulse) animations.push('icon-pulse 1s ease-in-out infinite');
  
  const computedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: pixelSize,
    height: pixelSize,
    color: iconColor,
    fill: 'currentColor',
    flexShrink: 0,
    ...(transforms.length > 0 && { transform: transforms.join(' ') }),
    ...(animations.length > 0 && { animation: animations.join(', ') }),
    ...style,
  };
  
  // If there are animations, inject the keyframes
  const keyframesStyle = (spin || pulse) ? (
    <style>
      {`
        @keyframes icon-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes icon-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}
    </style>
  ) : null;
  
  return (
    <>
      {keyframesStyle}
      <span
        className={className}
        style={computedStyle}
        role={ariaLabel ? 'img' : undefined}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden ?? !ariaLabel}
        data-testid={testID}
        data-icon-name={name}
      >
        {children}
      </span>
    </>
  );
};

Icon.displayName = 'Icon';

// Common icon components
export const ChevronRightIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </Icon>
);

export const ChevronDownIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </Icon>
);

export const SearchIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  </Icon>
);

export const PlayIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  </Icon>
);

export const HeartIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  </Icon>
);

export const HeartFilledIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  </Icon>
);

export const SettingsIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  </Icon>
);

export const HomeIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  </Icon>
);

export const GridIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  </Icon>
);

export const FolderIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  </Icon>
);

export const CloseIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </Icon>
);

export const MoreIcon: React.FC<Omit<IconProps, 'children'>> = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
    </svg>
  </Icon>
);

export default Icon;
