/**
 * Input Component
 * Text input with support for icons and validation states
 */

import React from 'react';

export interface InputProps {
  /** Input value */
  value?: string;
  /** Default value for uncontrolled input */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Input type */
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Icon on the left */
  leftIcon?: React.ReactNode;
  /** Icon on the right */
  rightIcon?: React.ReactNode;
  /** Full width */
  fullWidth?: boolean;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Focus handler */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Blur handler */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Key down handler */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
  /** Input name */
  name?: string;
  /** Auto focus */
  autoFocus?: boolean;
  /** Aria label */
  'aria-label'?: string;
}

const sizeStyles: Record<NonNullable<InputProps['size']>, { container: React.CSSProperties; input: React.CSSProperties }> = {
  sm: {
    container: {
      height: 32,
      borderRadius: 6,
      fontSize: 14,
      paddingLeft: 10,
      paddingRight: 10,
    },
    input: {
      fontSize: 14,
    },
  },
  md: {
    container: {
      height: 40,
      borderRadius: 8,
      fontSize: 16,
      paddingLeft: 12,
      paddingRight: 12,
    },
    input: {
      fontSize: 16,
    },
  },
  lg: {
    container: {
      height: 48,
      borderRadius: 10,
      fontSize: 18,
      paddingLeft: 14,
      paddingRight: 14,
    },
    input: {
      fontSize: 18,
    },
  },
};

const baseContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  backgroundColor: 'var(--input-bg, #1E293B)',
  border: '1px solid var(--input-border, #475569)',
  transition: 'all 0.15s ease',
  position: 'relative',
};

const baseInputStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  color: 'var(--input-text, #F1F5F9)',
  width: '100%',
};

export const Input: React.FC<InputProps> = ({
  value,
  defaultValue,
  placeholder,
  type = 'text',
  size = 'md',
  disabled = false,
  readOnly = false,
  error = false,
  errorMessage,
  leftIcon,
  rightIcon,
  fullWidth = false,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  className = '',
  style,
  testID,
  name,
  autoFocus = false,
  'aria-label': ariaLabel,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  
  const sizes = sizeStyles[size];
  
  const containerStyle: React.CSSProperties = {
    ...baseContainerStyle,
    ...sizes.container,
    ...(fullWidth && { width: '100%' }),
    ...(isFocused && !error && {
      borderColor: 'var(--input-focus-border, #10B981)',
      boxShadow: '0 0 0 3px var(--input-focus-ring, rgba(16, 185, 129, 0.2))',
    }),
    ...(error && {
      borderColor: 'var(--color-error, #EF4444)',
      boxShadow: '0 0 0 3px var(--error-ring, rgba(239, 68, 68, 0.2))',
    }),
    ...(disabled && {
      opacity: 0.5,
      cursor: 'not-allowed',
    }),
    ...(leftIcon && { paddingLeft: 12 }),
    ...(rightIcon && { paddingRight: 12 }),
    ...style,
  };
  
  const inputStyles: React.CSSProperties = {
    ...baseInputStyle,
    ...sizes.input,
    ...(disabled && { cursor: 'not-allowed' }),
  };
  
  const iconStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--input-icon, #64748B)',
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  
  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }}>
      <div className={className} style={containerStyle}>
        {leftIcon && <span style={iconStyle}>{leftIcon}</span>}
        <input
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          style={inputStyles}
          name={name}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          aria-invalid={error}
          data-testid={testID}
        />
        {rightIcon && <span style={iconStyle}>{rightIcon}</span>}
      </div>
      {error && errorMessage && (
        <p
          style={{
            color: 'var(--color-error, #EF4444)',
            fontSize: 12,
            margin: 0,
            marginTop: 4,
          }}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
};

Input.displayName = 'Input';

export default Input;
