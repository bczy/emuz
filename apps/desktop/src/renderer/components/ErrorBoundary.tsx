/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        padding: 32,
        textAlign: 'center',
      };

      const iconStyle: React.CSSProperties = {
        width: 64,
        height: 64,
        marginBottom: 24,
        color: '#EF4444',
      };

      const titleStyle: React.CSSProperties = {
        fontSize: 24,
        fontWeight: 600,
        marginBottom: 8,
      };

      const messageStyle: React.CSSProperties = {
        fontSize: 16,
        color: '#94A3B8',
        marginBottom: 24,
        maxWidth: 480,
      };

      const errorBoxStyle: React.CSSProperties = {
        backgroundColor: '#1E293B',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        maxWidth: 600,
        width: '100%',
        textAlign: 'left',
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#EF4444',
        overflow: 'auto',
        maxHeight: 200,
      };

      const buttonContainerStyle: React.CSSProperties = {
        display: 'flex',
        gap: 12,
      };

      const buttonBaseStyle: React.CSSProperties = {
        padding: '12px 24px',
        fontSize: 14,
        fontWeight: 500,
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      };

      const primaryButtonStyle: React.CSSProperties = {
        ...buttonBaseStyle,
        backgroundColor: '#10B981',
        color: '#FFFFFF',
      };

      const secondaryButtonStyle: React.CSSProperties = {
        ...buttonBaseStyle,
        backgroundColor: '#334155',
        color: '#F8FAFC',
      };

      return (
        <div style={containerStyle}>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>

          <h1 style={titleStyle}>Something went wrong</h1>
          
          <p style={messageStyle}>
            An unexpected error occurred. You can try reloading the app or resetting to continue.
          </p>

          {this.state.error && (
            <div style={errorBoxStyle}>
              <strong>{this.state.error.name}:</strong> {this.state.error.message}
              {this.state.errorInfo?.componentStack && (
                <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}

          <div style={buttonContainerStyle}>
            <button
              style={primaryButtonStyle}
              onClick={this.handleReload}
            >
              Reload App
            </button>
            <button
              style={secondaryButtonStyle}
              onClick={this.handleReset}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
