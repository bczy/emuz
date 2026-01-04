/**
 * Setup Wizard - First-run setup flow
 */

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@emuz/core';
import { Button, Input } from '@emuz/ui';

type WizardStep = 'welcome' | 'directories' | 'emulators' | 'appearance' | 'complete';

const steps: WizardStep[] = ['welcome', 'directories', 'emulators', 'appearance', 'complete'];

const SetupWizard: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, addRomDirectory, removeRomDirectory } = useSettingsStore();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [newRomPath, setNewRomPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;
  
  // Navigation handlers
  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  }, [currentIndex]);
  
  const handleBack = useCallback(() => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  }, [currentIndex]);
  
  const handleComplete = useCallback(() => {
    updateSettings({ setupComplete: true });
    navigate('/');
  }, [updateSettings, navigate]);
  
  const handleSkip = useCallback(() => {
    updateSettings({ setupComplete: true });
    navigate('/');
  }, [updateSettings, navigate]);
  
  // Directory handlers
  const handleAddDirectory = useCallback(() => {
    if (newRomPath.trim()) {
      addRomDirectory(newRomPath.trim());
      setNewRomPath('');
    }
  }, [newRomPath, addRomDirectory]);
  
  const handleBrowseFolder = useCallback(async () => {
    // TODO: Call IPC to open folder dialog
    console.log('Open folder dialog');
  }, []);
  
  // Emulator scan
  const handleScanEmulators = useCallback(async () => {
    setIsScanning(true);
    // TODO: Call IPC to scan for emulators
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsScanning(false);
  }, []);
  
  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div style={stepContentStyle}>
            <div style={welcomeLogoStyle}>
              <span style={welcomeLogoTextStyle}>EmuZ</span>
            </div>
            <h1 style={welcomeTitleStyle}>Welcome to EmuZ</h1>
            <p style={welcomeDescStyle}>
              Your all-in-one emulator frontend for retro gaming. 
              Let's set up your library and get you playing in just a few steps.
            </p>
            <div style={featuresListStyle}>
              <div style={featureItemStyle}>
                <div style={featureIconStyle}>📚</div>
                <div>
                  <strong>Unified Library</strong>
                  <p>All your games from every platform in one place</p>
                </div>
              </div>
              <div style={featureItemStyle}>
                <div style={featureIconStyle}>🎮</div>
                <div>
                  <strong>Easy Launch</strong>
                  <p>Auto-detect emulators and launch games instantly</p>
                </div>
              </div>
              <div style={featureItemStyle}>
                <div style={featureIconStyle}>🖼️</div>
                <div>
                  <strong>Rich Metadata</strong>
                  <p>Beautiful covers and game information</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'directories':
        return (
          <div style={stepContentStyle}>
            <h2 style={stepTitleStyle}>Add Your ROM Folders</h2>
            <p style={stepDescStyle}>
              Tell EmuZ where to find your games. You can add multiple folders 
              and organize them by platform or however you like.
            </p>
            
            {settings.romDirectories.length > 0 && (
              <div style={directoriesListStyle}>
                {settings.romDirectories.map((dir, index) => (
                  <div key={index} style={directoryItemStyle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                    <span style={directoryPathStyle}>{dir}</span>
                    <button
                      style={directoryRemoveStyle}
                      onClick={() => removeRomDirectory(dir)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div style={addDirectoryStyle}>
              <Input
                value={newRomPath}
                onChange={(e) => setNewRomPath(e.target.value)}
                placeholder="/path/to/your/roms"
                onKeyDown={(e) => e.key === 'Enter' && handleAddDirectory()}
              />
              <Button variant="secondary" onClick={handleBrowseFolder}>
                Browse...
              </Button>
              <Button variant="primary" onClick={handleAddDirectory} disabled={!newRomPath.trim()}>
                Add
              </Button>
            </div>
            
            <p style={hintTextStyle}>
              💡 Tip: Organize your ROMs in folders by platform for easier management.
            </p>
          </div>
        );
        
      case 'emulators':
        return (
          <div style={stepContentStyle}>
            <h2 style={stepTitleStyle}>Detect Emulators</h2>
            <p style={stepDescStyle}>
              EmuZ can automatically find emulators installed on your system. 
              You can also configure them manually later in Settings.
            </p>
            
            <div style={emulatorScanBoxStyle}>
              {isScanning ? (
                <div style={scanningStateStyle}>
                  <div style={spinnerStyle} />
                  <span>Scanning for emulators...</span>
                </div>
              ) : (
                <>
                  <Button variant="primary" size="large" onClick={handleScanEmulators}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    Scan for Emulators
                  </Button>
                  <p style={emulatorHintStyle}>
                    Supported emulators include RetroArch, Dolphin, PCSX2, DeSmuME, and many more.
                  </p>
                </>
              )}
            </div>
            
            <div style={emulatorResultsStyle}>
              <p style={noEmulatorsTextStyle}>
                No emulators detected yet. You can skip this step and configure emulators later.
              </p>
            </div>
          </div>
        );
        
      case 'appearance':
        return (
          <div style={stepContentStyle}>
            <h2 style={stepTitleStyle}>Choose Your Theme</h2>
            <p style={stepDescStyle}>
              Pick a theme that matches your style. You can change this anytime in Settings.
            </p>
            
            <div style={themeGridStyle}>
              <button
                style={{
                  ...themeCardStyle,
                  ...(settings.theme === 'dark' ? themeCardActiveStyle : {}),
                }}
                onClick={() => updateSettings({ theme: 'dark' })}
              >
                <div style={themePreviewDarkStyle}>
                  <div style={previewSidebarStyle('#1E293B')} />
                  <div style={previewContentStyle('#0F172A')} />
                </div>
                <span style={themeNameStyle}>Dark</span>
                <span style={themeDescStyle}>Easy on the eyes</span>
              </button>
              
              <button
                style={{
                  ...themeCardStyle,
                  ...(settings.theme === 'light' ? themeCardActiveStyle : {}),
                }}
                onClick={() => updateSettings({ theme: 'light' })}
              >
                <div style={themePreviewLightStyle}>
                  <div style={previewSidebarStyle('#E2E8F0')} />
                  <div style={previewContentStyle('#F8FAFC')} />
                </div>
                <span style={themeNameStyle}>Light</span>
                <span style={themeDescStyle}>Clean and bright</span>
              </button>
              
              <button
                style={{
                  ...themeCardStyle,
                  ...(settings.theme === 'system' ? themeCardActiveStyle : {}),
                }}
                onClick={() => updateSettings({ theme: 'system' })}
              >
                <div style={themePreviewSystemStyle}>
                  <div style={{ display: 'flex', height: '100%' }}>
                    <div style={{ ...previewSidebarStyle('#1E293B'), borderRadius: '8px 0 0 8px' }} />
                    <div style={{ flex: 1, display: 'flex' }}>
                      <div style={{ flex: 1, backgroundColor: '#0F172A' }} />
                      <div style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: '0 8px 8px 0' }} />
                    </div>
                  </div>
                </div>
                <span style={themeNameStyle}>System</span>
                <span style={themeDescStyle}>Match your OS</span>
              </button>
            </div>
            
            <div style={cardSizeSectionStyle}>
              <h3 style={subTitleStyle}>Card Size</h3>
              <div style={cardSizeOptionsStyle}>
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button
                    key={size}
                    style={{
                      ...cardSizeButtonStyle,
                      ...(settings.cardSize === size ? cardSizeButtonActiveStyle : {}),
                    }}
                    onClick={() => updateSettings({ cardSize: size })}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'complete':
        return (
          <div style={stepContentStyle}>
            <div style={completeIconStyle}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 style={completeTitleStyle}>You're All Set!</h2>
            <p style={completeDescStyle}>
              EmuZ is ready to go. Your library will be scanned for games and you can 
              start playing right away.
            </p>
            
            <div style={summaryBoxStyle}>
              <div style={summaryItemStyle}>
                <span style={summaryLabelStyle}>ROM Folders:</span>
                <span style={summaryValueStyle}>{settings.romDirectories.length}</span>
              </div>
              <div style={summaryItemStyle}>
                <span style={summaryLabelStyle}>Theme:</span>
                <span style={summaryValueStyle}>{settings.theme}</span>
              </div>
              <div style={summaryItemStyle}>
                <span style={summaryLabelStyle}>Card Size:</span>
                <span style={summaryValueStyle}>{settings.cardSize}</span>
              </div>
            </div>
            
            <p style={finalHintStyle}>
              You can always change these settings later. Happy gaming! 🎮
            </p>
          </div>
        );
    }
  };
  
  return (
    <div style={containerStyle}>
      {/* Progress bar */}
      <div style={progressBarContainerStyle}>
        <div style={{ ...progressBarStyle, width: `${progress}%` }} />
      </div>
      
      {/* Step indicator */}
      <div style={stepIndicatorStyle}>
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div
              style={{
                ...stepDotStyle,
                ...(index <= currentIndex ? stepDotActiveStyle : {}),
              }}
            >
              {index < currentIndex ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                style={{
                  ...stepLineStyle,
                  ...(index < currentIndex ? stepLineActiveStyle : {}),
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Content */}
      <div style={contentStyle}>
        {renderStep()}
      </div>
      
      {/* Navigation */}
      <div style={navigationStyle}>
        <div style={navLeftStyle}>
          {currentStep !== 'welcome' && currentStep !== 'complete' && (
            <Button variant="ghost" onClick={handleBack}>
              Back
            </Button>
          )}
        </div>
        <div style={navRightStyle}>
          {currentStep !== 'complete' && (
            <Button variant="ghost" onClick={handleSkip}>
              Skip Setup
            </Button>
          )}
          {currentStep === 'complete' ? (
            <Button variant="primary" size="large" onClick={handleComplete}>
              Start Using EmuZ
            </Button>
          ) : (
            <Button variant="primary" onClick={handleNext}>
              {currentStep === 'welcome' ? "Let's Go" : 'Continue'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: 'var(--bg-primary, #0F172A)',
};

const progressBarContainerStyle: React.CSSProperties = {
  height: 4,
  backgroundColor: 'var(--border-color, #334155)',
};

const progressBarStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: 'var(--primary, #10B981)',
  transition: 'width 0.3s ease',
};

const stepIndicatorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 0',
  gap: 0,
};

const stepDotStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  border: '2px solid var(--border-color, #334155)',
  backgroundColor: 'var(--bg-secondary, #1E293B)',
  color: 'var(--text-secondary, #94A3B8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 600,
};

const stepDotActiveStyle: React.CSSProperties = {
  borderColor: 'var(--primary, #10B981)',
  backgroundColor: 'var(--primary, #10B981)',
  color: '#FFFFFF',
};

const stepLineStyle: React.CSSProperties = {
  width: 60,
  height: 2,
  backgroundColor: 'var(--border-color, #334155)',
};

const stepLineActiveStyle: React.CSSProperties = {
  backgroundColor: 'var(--primary, #10B981)',
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 48px',
  overflow: 'auto',
};

const stepContentStyle: React.CSSProperties = {
  maxWidth: 560,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

const welcomeLogoStyle: React.CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: 20,
  backgroundColor: 'var(--primary, #10B981)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 24,
};

const welcomeLogoTextStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#FFFFFF',
};

const welcomeTitleStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: '#FFFFFF',
  marginBottom: 12,
};

const welcomeDescStyle: React.CSSProperties = {
  fontSize: 16,
  color: 'var(--text-secondary, #94A3B8)',
  lineHeight: 1.6,
  marginBottom: 32,
};

const featuresListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
  textAlign: 'left',
};

const featureItemStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  padding: 16,
  borderRadius: 12,
  backgroundColor: 'var(--bg-secondary, #1E293B)',
  border: '1px solid var(--border-color, #334155)',
};

const featureIconStyle: React.CSSProperties = {
  fontSize: 24,
};

const stepTitleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#FFFFFF',
  marginBottom: 12,
};

const stepDescStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary, #94A3B8)',
  lineHeight: 1.6,
  marginBottom: 24,
};

const directoriesListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
  marginBottom: 16,
};

const directoryItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  borderRadius: 8,
  backgroundColor: 'var(--bg-secondary, #1E293B)',
  border: '1px solid var(--border-color, #334155)',
  color: 'var(--text-secondary, #94A3B8)',
};

const directoryPathStyle: React.CSSProperties = {
  flex: 1,
  fontSize: 13,
  fontFamily: 'monospace',
  textAlign: 'left',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const directoryRemoveStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary, #94A3B8)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const addDirectoryStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  width: '100%',
};

const hintTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-secondary, #94A3B8)',
  marginTop: 16,
};

const emulatorScanBoxStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  padding: 32,
  borderRadius: 12,
  backgroundColor: 'var(--bg-secondary, #1E293B)',
  border: '1px solid var(--border-color, #334155)',
  width: '100%',
  marginBottom: 16,
};

const scanningStateStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  color: 'var(--text-secondary, #94A3B8)',
};

const spinnerStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  border: '2px solid var(--border-color, #334155)',
  borderTopColor: 'var(--primary, #10B981)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const emulatorHintStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary, #94A3B8)',
};

const emulatorResultsStyle: React.CSSProperties = {
  width: '100%',
};

const noEmulatorsTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-secondary, #94A3B8)',
  padding: 16,
  textAlign: 'center',
};

const themeGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 16,
  width: '100%',
  marginBottom: 32,
};

const themeCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  padding: 16,
  borderRadius: 12,
  border: '2px solid var(--border-color, #334155)',
  backgroundColor: 'transparent',
  cursor: 'pointer',
};

const themeCardActiveStyle: React.CSSProperties = {
  borderColor: 'var(--primary, #10B981)',
};

const themePreviewDarkStyle: React.CSSProperties = {
  width: '100%',
  height: 80,
  borderRadius: 8,
  overflow: 'hidden',
  display: 'flex',
  backgroundColor: '#0F172A',
  border: '1px solid #334155',
};

const themePreviewLightStyle: React.CSSProperties = {
  width: '100%',
  height: 80,
  borderRadius: 8,
  overflow: 'hidden',
  display: 'flex',
  backgroundColor: '#F8FAFC',
  border: '1px solid #CBD5E1',
};

const themePreviewSystemStyle: React.CSSProperties = {
  width: '100%',
  height: 80,
  borderRadius: 8,
  overflow: 'hidden',
  border: '1px solid #334155',
};

const previewSidebarStyle = (color: string): React.CSSProperties => ({
  width: 24,
  height: '100%',
  backgroundColor: color,
});

const previewContentStyle = (color: string): React.CSSProperties => ({
  flex: 1,
  height: '100%',
  backgroundColor: color,
});

const themeNameStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#FFFFFF',
};

const themeDescStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-secondary, #94A3B8)',
};

const cardSizeSectionStyle: React.CSSProperties = {
  width: '100%',
};

const subTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#FFFFFF',
  marginBottom: 12,
};

const cardSizeOptionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  justifyContent: 'center',
};

const cardSizeButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 8,
  border: '1px solid var(--border-color, #334155)',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary, #94A3B8)',
  cursor: 'pointer',
  fontSize: 14,
};

const cardSizeButtonActiveStyle: React.CSSProperties = {
  backgroundColor: 'var(--primary, #10B981)',
  borderColor: 'var(--primary, #10B981)',
  color: '#FFFFFF',
};

const completeIconStyle: React.CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: 'var(--primary, #10B981)',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 24,
};

const completeTitleStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: '#FFFFFF',
  marginBottom: 12,
};

const completeDescStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary, #94A3B8)',
  lineHeight: 1.6,
  marginBottom: 24,
};

const summaryBoxStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  width: '100%',
  padding: 20,
  borderRadius: 12,
  backgroundColor: 'var(--bg-secondary, #1E293B)',
  border: '1px solid var(--border-color, #334155)',
  marginBottom: 16,
};

const summaryItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
};

const summaryLabelStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary, #94A3B8)',
};

const summaryValueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#FFFFFF',
  textTransform: 'capitalize',
};

const finalHintStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary, #94A3B8)',
};

const navigationStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 24,
  borderTop: '1px solid var(--border-color, #334155)',
};

const navLeftStyle: React.CSSProperties = {
  flex: 1,
};

const navRightStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
};

export default SetupWizard;
