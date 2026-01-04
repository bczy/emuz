/**
 * SearchBar Component
 * Search input with debouncing and clear functionality
 */

import React from 'react';

export interface SearchBarProps {
  /** Current search value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Show keyboard shortcut hint */
  showShortcutHint?: boolean;
  /** Keyboard shortcut key */
  shortcutKey?: string;
  /** Search size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Change handler (debounced) */
  onChange?: (value: string) => void;
  /** Submit handler */
  onSubmit?: (value: string) => void;
  /** Clear handler */
  onClear?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

const sizeStyles = {
  sm: {
    height: 32,
    fontSize: 14,
    padding: '0 10px',
    iconSize: 14,
    borderRadius: 6,
  },
  md: {
    height: 40,
    fontSize: 16,
    padding: '0 12px',
    iconSize: 16,
    borderRadius: 8,
  },
  lg: {
    height: 48,
    fontSize: 18,
    padding: '0 16px',
    iconSize: 20,
    borderRadius: 10,
  },
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  placeholder = 'Search games...',
  debounceMs = 300,
  showShortcutHint = true,
  shortcutKey = '/',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onChange,
  onSubmit,
  onClear,
  onFocus,
  onBlur,
  className = '',
  style,
  testID,
}) => {
  const [internalValue, setInternalValue] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const config = sizeStyles[size];
  
  // Sync with external value
  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);
  
  // Keyboard shortcut handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user pressed the shortcut key while not in an input
      if (
        e.key === shortcutKey &&
        !isFocused &&
        !disabled &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Escape to blur
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutKey, isFocused, disabled]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    // Debounce the onChange callback
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onChange?.(newValue);
    }, debounceMs);
  };
  
  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit?.(internalValue);
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: config.height,
    backgroundColor: 'var(--searchbar-bg, #1E293B)',
    border: '1px solid var(--searchbar-border, #334155)',
    borderRadius: config.borderRadius,
    transition: 'all 0.15s ease',
    ...(fullWidth && { width: '100%' }),
    ...(isFocused && {
      borderColor: 'var(--color-primary, #10B981)',
      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
    }),
    ...(disabled && {
      opacity: 0.5,
      cursor: 'not-allowed',
    }),
    ...style,
  };
  
  const inputStyle: React.CSSProperties = {
    flex: 1,
    height: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: 'var(--searchbar-text, #F1F5F9)',
    fontSize: config.fontSize,
    padding: config.padding,
    paddingLeft: config.iconSize + 24,
    paddingRight: internalValue ? config.iconSize + 24 : (showShortcutHint && !isFocused ? 44 : 12),
  };
  
  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: 12,
    display: 'flex',
    alignItems: 'center',
    color: 'var(--searchbar-icon, #64748B)',
    pointerEvents: 'none',
  };
  
  const clearButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: 8,
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'var(--text-muted, #64748B)',
    borderRadius: 4,
    transition: 'all 0.15s ease',
  };
  
  const shortcutHintStyle: React.CSSProperties = {
    position: 'absolute',
    right: 12,
    padding: '2px 6px',
    borderRadius: 4,
    backgroundColor: 'var(--surface-secondary, #334155)',
    color: 'var(--text-muted, #64748B)',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'monospace',
    pointerEvents: 'none',
  };
  
  const spinnerStyle: React.CSSProperties = {
    position: 'absolute',
    right: 12,
    width: config.iconSize,
    height: config.iconSize,
    border: '2px solid var(--border, #334155)',
    borderTopColor: 'var(--color-primary, #10B981)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };
  
  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className={className} style={containerStyle} data-testid={testID}>
        {/* Search Icon */}
        <span style={iconStyle}>
          <svg
            width={config.iconSize}
            height={config.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={inputStyle}
          aria-label="Search"
        />
        
        {/* Loading Spinner */}
        {loading && <div style={spinnerStyle} />}
        
        {/* Clear Button */}
        {!loading && internalValue && (
          <button
            style={clearButtonStyle}
            onClick={handleClear}
            aria-label="Clear search"
            tabIndex={-1}
          >
            <svg
              width={config.iconSize - 2}
              height={config.iconSize - 2}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        
        {/* Keyboard Shortcut Hint */}
        {!loading && !internalValue && showShortcutHint && !isFocused && (
          <span style={shortcutHintStyle}>{shortcutKey}</span>
        )}
      </div>
    </>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;
