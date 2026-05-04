// constants/colors.ts
// iOS-native aligned color system with light/dark mode support
// Follows Apple Human Interface Guidelines color hierarchy

type ColorScheme = 'light' | 'dark';

interface ColorPalette {
  // Core Brand
  primary: string;
  primaryNavy: string;
  accentBlue: string;
  accentBlueSoft: string;
  
  // Surfaces
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  surfaceElevation1: string;
  surfaceElevation2: string;
  surfaceElevation3: string;
  
  // Text (on surface)
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  onPrimary: string;
  onSurface: string;
  
  // UI Elements
  separator: string;
  separatorOpaque: string;
  border: string;
  outline: string;
  outlineVariant: string;
  
  // System
  white: string;
  black: string;
  transparent: string;
  
  // Status
  success: string;
  warning: string;
  error: string;
  onError: string;
  info: string;
  
  // Attendance states
  present: string;
  absent: string;
  excused: string;

  // Legacy/Compatibility support (referenced in existing audit)
  background: string;
  onSurfaceVariant: string;
  carryover: string;
  accentBlueLegacy: string;
  
  // M3 Tonal Containers
  primaryContainer: string;
  onPrimaryContainer: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  errorContainer: string;
  onErrorContainer: string;
  surfaceVariant: string;
}

const LightPalette: ColorPalette = {
  // Brand
  primary: '#007AFF',           // iOS system blue
  primaryNavy: '#1C1C8C',       // Deep institutional navy
  accentBlue: '#34C759',        // Vibrant but controlled
  accentBlueSoft: '#34C75915',
  
  // Surfaces (iOS system background hierarchy)
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',  // iOS system grouped background
  surfaceTertiary: '#E5E5EA',   // iOS secondary grouped
  surfaceElevation1: '#FFFFFF',
  surfaceElevation2: '#F9F9F9',
  surfaceElevation3: '#F2F2F7',
  
  // Text
  textPrimary: '#000000',
  textSecondary: '#3C3C4399',   // iOS secondary label (60% opacity black)
  textTertiary: '#3C3C434D',    // iOS tertiary label (30% opacity black)
  onPrimary: '#FFFFFF',
  onSurface: '#000000',
  
  // UI
  separator: '#3C3C434A',       // iOS separator (29% opacity)
  separatorOpaque: '#C6C6C8',   // Opaque separator for borders
  border: '#E5E5EA',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  
  // System
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Status
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  onError: '#FFFFFF',
  info: '#007AFF',
  
  // Attendance
  present: '#34C759',
  absent: '#FF3B30',
  excused: '#FF9500',

  // Compatibility
  background: '#FFFFFF',
  onSurfaceVariant: '#3C3C4399',
  carryover: '#5856D6',
  accentBlueLegacy: '#007AFF',
  
  primaryContainer: '#D1E4FF',
  onPrimaryContainer: '#001D36',
  secondaryContainer: '#D7E3F7',
  onSecondaryContainer: '#101C2B',
  tertiaryContainer: '#F3DAFF',
  onTertiaryContainer: '#251431',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  surfaceVariant: '#E1E2EC',
};

const DarkPalette: ColorPalette = {
  // Brand (slightly adjusted for dark mode contrast)
  primary: '#0A84FF',           // iOS system blue dark variant
  primaryNavy: '#5E5CE6',       // Lighter navy for dark bg
  accentBlue: '#30D158',        // iOS system green dark variant
  accentBlueSoft: '#30D15815',
  
  // Surfaces (iOS dark mode hierarchy)
  surface: '#000000',
  surfaceSecondary: '#1C1C1E',  // iOS system background dark
  surfaceTertiary: '#2C2C2E',  // iOS secondary background dark
  surfaceElevation1: '#1C1C1E',
  surfaceElevation2: '#2C2C2E',
  surfaceElevation3: '#3A3A3C',
  
  // Text (on dark surface)
  textPrimary: '#FFFFFF',
  textSecondary: '#EBEBF599',   // iOS secondary label dark (60% opacity white)
  textTertiary: '#EBEBF54D',    // iOS tertiary label dark (30% opacity white)
  onPrimary: '#FFFFFF',
  onSurface: '#FFFFFF',
  
  // UI
  separator: '#54545899',       // iOS separator dark
  separatorOpaque: '#38383A',   // Opaque separator dark
  border: '#38383A',
  outline: '#938F99',
  outlineVariant: '#49454F',
  
  // System
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Status (same semantic colors, adjusted for dark if needed)
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  onError: '#FFFFFF',
  info: '#0A84FF',
  
  // Attendance
  present: '#30D158',
  absent: '#FF453A',
  excused: '#FF9F0A',

  // Compatibility
  background: '#000000',
  onSurfaceVariant: '#EBEBF599',
  carryover: '#5E5CE6',
  accentBlueLegacy: '#0A84FF',
  
  primaryContainer: '#00497E',
  onPrimaryContainer: '#D1E4FF',
  secondaryContainer: '#3B4858',
  onSecondaryContainer: '#D7E3F7',
  tertiaryContainer: '#533D5E',
  onTertiaryContainer: '#F3DAFF',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  surfaceVariant: '#44474F',
};

// Theme-aware export
export const Colors = {
    light: LightPalette,
    dark: DarkPalette,
};

// Export both for scheme-aware components
export { LightPalette, DarkPalette };
export type { ColorPalette };

// Helper for dynamic scheme switching (used with useColorScheme or Zustand store)
export const getPalette = (scheme: ColorScheme): ColorPalette => 
  scheme === 'dark' ? DarkPalette : LightPalette;
