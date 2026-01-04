/**
 * Settings Screen - App settings and configuration
 */

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@emuz/core';
import { Button, Input } from '@emuz/ui';
import type { Settings } from '@emuz/core';

// Settings sections
type SettingsSection = 'general' | 'library' | 'appearance' | 'emulators' | 'about';

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, addRomDirectory, removeRomDirectory } = useSettingsStore();
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [newRomPath, setNewRomPath] = useState('');
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  // Add ROM directory
  const handleAddRomDirectory = useCallback(() => {
    if (newRomPath.trim()) {
      addRomDirectory(newRomPath.trim());
      setNewRomPath('');
    }
  }, [newRomPath, addRomDirectory]);
  
  // Open folder picker (via IPC in real app)
  const handleBrowseFolder = useCallback(async () => {
    // TODO: Call IPC to open folder dialog
    console.log('Open folder dialog');
  }, []);
  
  // Rescan library
  const handleRescanLibrary = useCallback(() => {
    console.log('Rescan library');
    // TODO: Trigger library rescan
  }, []);
  
  // Render section content
  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div style={sectionContentStyle}>
            <h2 style={sectionTitleStyle}>General Settings</h2>
            
            <div style={settingGroupStyle}>
              <h3 style={groupTitleStyle}>Language</h3>
              <select
                style={selectStyle}
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value as Settings['language'] })}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
              </select>
            </div>
            
            <div style={settingGroupStyle}>
              <h3 style={groupTitleStyle}>Startup</h3>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={settings.autoScan}
                  onChange={(e) => updateSettings({ autoScan: e.target.checked })}
                />
                <span>Auto-scan library on startup</span>
              </label>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={settings.minimizeToTray}
                  onChange={(e) => updateSettings({ minimizeToTray: e.target.checked })}
                />
                <span>Minimize to system tray on close</span>
              </label>
            </div>
          </div>
        );
        
      case 'library':
        return (
          <div style={sectionContentStyle}>
            <h2 style={sectionTitleStyle}>Library Settings</h2>
            
            <div style={settingGroupStyle}>
              <h3 style={groupTitleStyle}>ROM Directories</h3>
              <p style={groupDescStyle}>
                Add folders containing your ROM files. EmuZ will scan these folders for games.
              </p>
              
              <div style={romDirsListStyle}>
                {settings.romDirectories.map((dir, index) => (
                  <div key={index} style={romDirItemStyle}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                    <span style={romDirPathStyle}>{dir}</span>
                    <button
                      style={romDirRemoveStyle}
                      onClick={() => removeRomDirectory(dir)}
                      title="Remove directory"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <div style={addRomDirStyle}>
                <Input
                  value={newRomPath}
                  onChange={(e) => setNewRomPath(e.target.value)}
                  placeholder="/path/to/roms"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRomDirectory()}
                />
                <Button variant="secondary" onClick={handleBrowseFolder}>
                  Browse...
                </Button>
                <Button variant="primary" onClick={handleAddRomDirectory} disabled={!newRomPath.trim()}>
                  Add
                </Button>
              </div>
              
              <Button variant="secondary" onClick={handleRescanLibrary} style={{ marginTop: 16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Rescan Library
              </Button>
            </div>
            
            <div style={settingGroupStyle}>
              <h3 style={groupTitleStyle}>Metadata</h3>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={settings.autoFetchMetadata}
                  onChange={(e) => updateSettings({ autoFetchMetadata: e.target.checked })}
                />
                <span>Automatically fetch game metadata and covers</span>
              </label>
            </div>
          </div>
        );
        
      case 'appearance':
        return (
          <div style={sectionContentStyle}>
            <h2 style={sectionTitleStyle}>Appearance</h2>
            
            <div style={settingGroupStyle}>
              <h3 style={groupTitleStyle}>Theme</h3>
              <div style={themeOptionsStyle}>
                <button
                  style={{
                    ...themeOptionStyle,
                    ...(settings.theme === 'dark' ? themeOptionActiveStyle : {}),
                  }}
                  onClick={() => updateSettings({ theme: 'dark' })}
                >
                  <div style={themeDarkPreviewStyle} />
                  <span>Dark</span>
                </button>
                <button
                  style={{
                    ...themeOptionStyle,
                    ...(settings.theme === 'light' ? themeOptionActiveStyle : {}),
                  }}
                  onClick={() => updateSettings({ theme: 'light' })}
                >
                  <div style={themeLightPreviewStyle} />
                  <span>Light</span>
                </button>
                <button
                  style={{
                    ...themeOptionStyle,
                    ...(settings.theme === 'system' ? themeOptionActiveStyle : {}),
                  }}
                  onClick={() => updateSettings({ theme: 'system' })}
                >
                  <div style={themeSystemPreviewStyle} />
                  <span>System</span>
                </button>
              </div>
            </div>
            
            <div style={settingGroupStyle}>
              <h3 style={groupTitleStyle}>Game Cards</h3>
              <div style={cardSizeOptionsStyle}>
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button
                    key={size}
                    style={{
                      ...cardSizeOptionStyle,
                      ...(settings.cardSize === size ? cardSizeOptionActiveStyle : {}),
                    }}
                    onClick={() => updateSettings({ cardSize: size })}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
              
              <label style={{ ...checkboxLabelStyle, marginTop: 16 }}>
                <input
                  type="checkbox"
                  checked={settings.showPlatformBadge}
                  onChange={(e) => updateSettings({ showPlatformBadge: e.target.checked })}
                />
                <span>Show platform badge on game cards</span>
              </label>
            </div>
          </div>
        );
        
      case 'emulators':
        return (
          <div style={sectionContentStyle}>
            <h2 style={sectionTitleStyle}>Emulator Settings</h2>
            
            <div style={settingGroupStyle}>
              <h3 style={groupTitleStyle}>Default Emulators</h3>
              <p style={groupDescStyle}>
                Configure which emulators to use for each platform. EmuZ will auto-detect installed emulators.
              </p>
              
              <Button variant="secondary" onClick={() => console.log('Detect emulators')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Detect Emulators
              </Button>
              
              <div style={emulatorListStyle}>
                <p style={emptyTextStyle}>
                  No emulators configured. Click "Detect Emulators" to scan for installed emulators.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'about':
        return (
          <div style={sectionContentStyle}>
            <h2 style={sectionTitleStyle}>About EmuZ</h2>
            
            <div style={aboutCardStyle}>
              <div style={aboutLogoStyle}>
                <span style={aboutLogoTextStyle}>EmuZ</span>
              </div>
              <div style={aboutInfoStyle}>
                <p style={aboutVersionStyle}>Version 1.0.0</p>
                <p style={aboutDescStyle}>
                  A Daijishou-inspired cross-platform emulator frontend.
                </p>
              </div>
            </div>
            
            <div style={settingGroupStyle}>
              <h3 style={groupTitleStyle}>Links</h3>
              <div style={linksListStyle}>
                <a href="https://github.com/emuz" target="_blank" rel="noopener noreferrer" style={linkItemStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub Repository
                </a>
                <a href="https://emuz.io/docs" target="_blank" rel="noopener noreferrer" style={linkItemStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  Documentation
                </a>
                <a href="https://discord.gg/emuz" target="_blank" rel="noopener noreferrer" style={linkItemStyle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                  Discord Community
                </a>
              </div>
            </div>
            
            <div style={settingGroupStyle}>
              <h3 style={groupTitleStyle}>Acknowledgments</h3>
              <p style={groupDescStyle}>
                Built with Electron, React, and TypeScript. Inspired by Daijishou and other great emulator frontends.
              </p>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button style={backButtonStyle} onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 style={titleStyle}>Settings</h1>
      </div>
      
      {/* Settings layout */}
      <div style={settingsLayoutStyle}>
        {/* Sidebar navigation */}
        <nav style={navStyle}>
          <button
            style={navItemStyle(activeSection === 'general')}
            onClick={() => setActiveSection('general')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            General
          </button>
          <button
            style={navItemStyle(activeSection === 'library')}
            onClick={() => setActiveSection('library')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
            Library
          </button>
          <button
            style={navItemStyle(activeSection === 'appearance')}
            onClick={() => setActiveSection('appearance')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
            Appearance
          </button>
          <button
            style={navItemStyle(activeSection === 'emulators')}
            onClick={() => setActiveSection('emulators')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
            </svg>
            Emulators
          </button>
          <button
            style={navItemStyle(activeSection === 'about')}
            onClick={() => setActiveSection('about')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            About
          </button>
        </nav>
        
        {/* Content */}
        <div style={contentStyle}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  gap: 24,
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
};

const backButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  border: '1px solid var(--border-color, #334155)',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary, #94A3B8)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#FFFFFF',
};

const settingsLayoutStyle: React.CSSProperties = {
  display: 'flex',
  gap: 24,
  flex: 1,
  overflow: 'hidden',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  width: 200,
  flexShrink: 0,
};

const navItemStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 12px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: active ? 'var(--primary, #10B981)' : 'transparent',
  color: active ? '#FFFFFF' : 'var(--text-secondary, #94A3B8)',
  fontSize: 14,
  fontWeight: active ? 500 : 400,
  cursor: 'pointer',
  textAlign: 'left' as const,
});

const contentStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  backgroundColor: 'var(--bg-secondary, #1E293B)',
  borderRadius: 12,
  border: '1px solid var(--border-color, #334155)',
};

const sectionContentStyle: React.CSSProperties = {
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  color: '#FFFFFF',
  marginBottom: 8,
};

const settingGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const groupTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#FFFFFF',
};

const groupDescStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-secondary, #94A3B8)',
  lineHeight: 1.5,
};

const selectStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--border-color, #334155)',
  backgroundColor: 'var(--bg-primary, #0F172A)',
  color: '#FFFFFF',
  fontSize: 14,
  maxWidth: 200,
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 14,
  color: 'var(--text-secondary, #94A3B8)',
  cursor: 'pointer',
};

const romDirsListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const romDirItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 12px',
  borderRadius: 8,
  backgroundColor: 'var(--bg-primary, #0F172A)',
  border: '1px solid var(--border-color, #334155)',
  color: 'var(--text-secondary, #94A3B8)',
};

const romDirPathStyle: React.CSSProperties = {
  flex: 1,
  fontSize: 13,
  fontFamily: 'monospace',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const romDirRemoveStyle: React.CSSProperties = {
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

const addRomDirStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
};

const themeOptionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
};

const themeOptionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  padding: 12,
  borderRadius: 8,
  border: '2px solid var(--border-color, #334155)',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary, #94A3B8)',
  cursor: 'pointer',
  fontSize: 13,
};

const themeOptionActiveStyle: React.CSSProperties = {
  borderColor: 'var(--primary, #10B981)',
  color: '#FFFFFF',
};

const themeDarkPreviewStyle: React.CSSProperties = {
  width: 60,
  height: 40,
  borderRadius: 6,
  backgroundColor: '#0F172A',
  border: '1px solid #334155',
};

const themeLightPreviewStyle: React.CSSProperties = {
  width: 60,
  height: 40,
  borderRadius: 6,
  backgroundColor: '#F8FAFC',
  border: '1px solid #CBD5E1',
};

const themeSystemPreviewStyle: React.CSSProperties = {
  width: 60,
  height: 40,
  borderRadius: 6,
  background: 'linear-gradient(90deg, #0F172A 50%, #F8FAFC 50%)',
  border: '1px solid #334155',
};

const cardSizeOptionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
};

const cardSizeOptionStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 6,
  border: '1px solid var(--border-color, #334155)',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary, #94A3B8)',
  cursor: 'pointer',
  fontSize: 13,
};

const cardSizeOptionActiveStyle: React.CSSProperties = {
  backgroundColor: 'var(--primary, #10B981)',
  borderColor: 'var(--primary, #10B981)',
  color: '#FFFFFF',
};

const emulatorListStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 8,
  backgroundColor: 'var(--bg-primary, #0F172A)',
  border: '1px solid var(--border-color, #334155)',
  marginTop: 12,
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-secondary, #94A3B8)',
  textAlign: 'center',
};

const aboutCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  padding: 20,
  borderRadius: 12,
  backgroundColor: 'var(--bg-primary, #0F172A)',
  border: '1px solid var(--border-color, #334155)',
};

const aboutLogoStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 12,
  backgroundColor: 'var(--primary, #10B981)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const aboutLogoTextStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: '#FFFFFF',
};

const aboutInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const aboutVersionStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: '#FFFFFF',
};

const aboutDescStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-secondary, #94A3B8)',
};

const linksListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const linkItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 12px',
  borderRadius: 8,
  backgroundColor: 'var(--bg-primary, #0F172A)',
  border: '1px solid var(--border-color, #334155)',
  color: 'var(--text-secondary, #94A3B8)',
  textDecoration: 'none',
  fontSize: 14,
};

export default SettingsScreen;
