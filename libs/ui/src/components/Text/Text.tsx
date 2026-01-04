/**
 * Text Component
 * Typography component with preset variants
 */

import React from 'react';

export interface TextProps {
  /** Text content */
  children: React.ReactNode;
  /** Typography variant */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'bodySmall' | 'caption' | 'label' | 'code';
  /** Text color (uses theme colors) */
  color?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'accent' | 'error' | 'success' | 'warning';
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Font weight override */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** Number of lines before truncating (mobile) */
  numberOfLines?: number;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Accessibility role */
  role?: string;
  /** Test ID for testing */
  testID?: string;
}

const variantStyles: Record<NonNullable<TextProps['variant']>, React.CSSProperties> = {
  h1: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 1.25,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 1.3,
  },
  h4: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 1.35,
  },
  h5: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 1.4,
  },
  h6: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 1.4,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 1.4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 1.4,
  },
  code: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 1.5,
    fontFamily: 'monospace',
  },
};

const colorMap: Record<NonNullable<TextProps['color']>, string> = {
  primary: 'var(--text-primary, #F8FAFC)',
  secondary: 'var(--text-secondary, #CBD5E1)',
  tertiary: 'var(--text-tertiary, #94A3B8)',
  muted: 'var(--text-muted, #64748B)',
  accent: 'var(--color-accent, #10B981)',
  error: 'var(--color-error, #EF4444)',
  success: 'var(--color-success, #22C55E)',
  warning: 'var(--color-warning, #F59E0B)',
};

const weightMap: Record<NonNullable<TextProps['weight']>, string> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

const alignMap: Record<NonNullable<TextProps['align']>, 'left' | 'center' | 'right'> = {
  left: 'left',
  center: 'center',
  right: 'right',
};

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  align,
  weight,
  truncate = false,
  numberOfLines,
  className = '',
  style,
  role,
  testID,
}) => {
  const variantStyle = variantStyles[variant];
  const textColor = colorMap[color];
  
  const computedStyle: React.CSSProperties = {
    ...variantStyle,
    color: textColor,
    ...(align && { textAlign: alignMap[align] }),
    ...(weight && { fontWeight: weightMap[weight] }),
    ...(truncate && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    ...(numberOfLines && numberOfLines > 1 && {
      display: '-webkit-box',
      WebkitLineClamp: numberOfLines,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    }),
    margin: 0,
    ...style,
  };
  
  // Determine the HTML element based on variant
  const getElement = (): 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'code' | 'label' | 'span' => {
    if (variant.startsWith('h')) {
      return variant as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    }
    if (variant === 'code') {
      return 'code';
    }
    if (variant === 'label') {
      return 'label';
    }
    return 'p';
  };
  
  const Element = getElement();
  
  return React.createElement(
    Element as string,
    {
      className,
      style: computedStyle,
      role,
      'data-testid': testID,
    },
    children
  );
};

Text.displayName = 'Text';

export default Text;
