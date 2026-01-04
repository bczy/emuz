/**
 * Emulator registry types
 */

/**
 * Supported host platforms
 */
export type HostPlatform = 'windows' | 'macos' | 'linux' | 'android' | 'ios';

/**
 * Emulator definition in the registry
 */
export interface EmulatorDefinition {
  id: string;
  name: string;
  description: string;
  website: string;
  
  /** Gaming platforms this emulator supports */
  platformIds: string[];
  
  /** Host platforms where this emulator runs */
  hostPlatforms: HostPlatform[];
  
  /** Desktop executable patterns */
  desktop?: {
    /** Executable names by OS */
    executables: {
      windows?: string[];
      macos?: string[];
      linux?: string[];
    };
    /** Default installation paths by OS */
    installPaths?: {
      windows?: string[];
      macos?: string[];
      linux?: string[];
    };
    /** Command line template for launching ROMs */
    commandTemplate?: string;
    /** Default core path (for RetroArch) */
    corePath?: string;
  };
  
  /** Android app information */
  android?: {
    packageName: string;
    intentAction?: string;
    intentType?: string;
  };
  
  /** iOS app information */
  ios?: {
    urlScheme: string;
    appStoreId?: string;
  };
  
  /** RetroArch core information */
  retroarchCore?: {
    coreName: string;
    coreFile: {
      windows?: string;
      macos?: string;
      linux?: string;
      android?: string;
      ios?: string;
    };
  };
  
  /** Icon asset name */
  iconName?: string;
  
  /** Whether this is a RetroArch core */
  isRetroarchCore?: boolean;
}

/**
 * Emulator search criteria
 */
export interface EmulatorSearchCriteria {
  platformId?: string;
  hostPlatform?: HostPlatform;
  isRetroarchCore?: boolean;
}

/**
 * Detection result
 */
export interface DetectedEmulator {
  definition: EmulatorDefinition;
  executablePath?: string;
  packageName?: string;
  urlScheme?: string;
  isInstalled: boolean;
}
