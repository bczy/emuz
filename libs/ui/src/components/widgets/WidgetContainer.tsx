/**
 * WidgetContainer Component
 * Base container for dashboard widgets
 */

import React from 'react';
import type { Widget } from '@emuz/core';

export interface WidgetContainerProps {
  /** Widget data */
  widget?: Widget;
  /** Widget title */
  title?: string;
  /** Widget size */
  size?: 'small' | 'medium' | 'large' | 'wide' | 'tall';
  /** Is dragging */
  isDragging?: boolean;
  /** Is editing mode (show controls) */
  isEditing?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Children content */
  children: React.ReactNode;
  /** Header action */
  headerAction?: React.ReactNode;
  /** Remove handler */
  onRemove?: () => void;
  /** Settings handler */
  onSettings?: () => void;
  /** Drag start handler */
  onDragStart?: (e: React.DragEvent) => void;
  /** Drag end handler */
  onDragEnd?: (e: React.DragEvent) => void;
  /** Additional class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testID?: string;
}

const sizeConfig = {
  small: { minWidth: 160, minHeight: 160 },
  medium: { minWidth: 320, minHeight: 160 },
  large: { minWidth: 320, minHeight: 320 },
  wide: { minWidth: 480, minHeight: 160 },
  tall: { minWidth: 160, minHeight: 320 },
};

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  title,
  size = 'medium',
  isDragging = false,
  isEditing = false,
  loading = false,
  children,
  headerAction,
  onRemove,
  onSettings,
  onDragStart,
  onDragEnd,
  className = '',
  style,
  testID,
}) => {
  const config = sizeConfig[size];
  
  const containerStyle: React.CSSProperties = {
    minWidth: config.minWidth,
    minHeight: config.minHeight,
    backgroundColor: 'var(--widget-bg, #1E293B)',
    border: '1px solid var(--widget-border, #334155)',
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease',
    ...(isDragging && {
      opacity: 0.7,
      transform: 'scale(1.02)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    }),
    ...(isEditing && {
      cursor: 'grab',
      border: '2px dashed var(--color-primary, #10B981)',
    }),
    ...style,
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid var(--widget-header-border, #334155)',
    minHeight: 48,
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-primary, #F8FAFC)',
    margin: 0,
  };
  
  const headerActionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };
  
  const iconButtonStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-muted, #64748B)',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  };
  
  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: 16,
    overflow: 'auto',
    position: 'relative',
  };
  
  const loadingOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--widget-bg, #1E293B)',
  };
  
  const spinnerStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    border: '2px solid var(--border, #334155)',
    borderTopColor: 'var(--color-primary, #10B981)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };
  
  const displayTitle = title || widget?.title;
  
  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        className={className}
        style={containerStyle}
        draggable={isEditing}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        data-testid={testID}
        data-widget-id={widget?.id}
      >
        {/* Header */}
        {(displayTitle || isEditing || headerAction) && (
          <div style={headerStyle}>
            <h3 style={titleStyle}>{displayTitle}</h3>
            <div style={headerActionsStyle}>
              {headerAction}
              {isEditing && (
                <>
                  {onSettings && (
                    <button
                      style={iconButtonStyle}
                      onClick={onSettings}
                      aria-label="Widget settings"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </button>
                  )}
                  {onRemove && (
                    <button
                      style={{ ...iconButtonStyle, color: 'var(--color-error, #EF4444)' }}
                      onClick={onRemove}
                      aria-label="Remove widget"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div style={contentStyle}>
          {loading ? (
            <div style={loadingOverlayStyle}>
              <div style={spinnerStyle} />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </>
  );
};

WidgetContainer.displayName = 'WidgetContainer';

export default WidgetContainer;
