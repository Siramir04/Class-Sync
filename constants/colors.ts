// constants/colors.ts
// Teal-centric design system — ClassSync UI Remaster
// Light: airy #F0F4F8 bg, deep teal #0F4C5C sidebar
// Dark: navy #0F172A bg, darker teal #0A2E3A sidebar

type ColorScheme = 'light' | 'dark';

interface ColorPalette {
  // Core Brand
  primary: string;
  primaryNavy: string;
  accentBlue: string;
  accentBlueSoft: string;
  
  // New: Accent Secondary (teal progress bars, success indicators)
  accentSecondary: string;
  
  // Surfaces
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  surfaceElevation1: string;
  surfaceElevation2: string;
  surfaceElevation3: string;
  
  // Sidebar
  bgSidebar: string;
  
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
  borderSubtle: string;
  outline: string;
  outlineVariant: string;
  
  // Shadows (as strings — applied via style objects)
  shadowCard: string;
  shadowFloat: string;
  
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
  
  // M3 Tonal Containers (mapped to teal palette)
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
  // Brand — Deep teal primary
  primary: '#0F4C5C',
  primaryNavy: '#0F4C5C',
  accentBlue: '#38B2AC',         // Teal accent
  accentBlueSoft: '#38B2AC15',
  accentSecondary: '#38B2AC',    // Progress bars, success indicators
  
  // Surfaces — Airy, not pure white
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F4F8',   // Main app background
  surfaceTertiary: '#E2E8F0',
  surfaceElevation1: '#FFFFFF',
  surfaceElevation2: '#F7FAFC',
  surfaceElevation3: '#F0F4F8',
  
  // Sidebar
  bgSidebar: '#0F4C5C',
  
  // Text
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textTertiary: '#A0AEC0',
  onPrimary: '#FFFFFF',
  onSurface: '#1A202C',
  
  // UI
  separator: '#E2E8F0',
  separatorOpaque: '#CBD5E0',
  border: '#E2E8F0',
  borderSubtle: '#E2E8F0',
  outline: '#A0AEC0',
  outlineVariant: '#E2E8F0',
  
  // Shadows
  shadowCard: '0 4px 6px -1px rgba(0,0,0,0.05)',
  shadowFloat: '0 10px 15px -3px rgba(0,0,0,0.08)',
  
  // System
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Status
  success: '#38B2AC',
  warning: '#ECC94B',
  error: '#F56565',
  onError: '#FFFFFF',
  info: '#0F4C5C',
  
  // Attendance
  present: '#38B2AC',
  absent: '#F56565',
  excused: '#ECC94B',

  // Compatibility
  background: '#F0F4F8',
  onSurfaceVariant: '#4A5568',
  carryover: '#805AD5',
  accentBlueLegacy: '#0F4C5C',
  
  // Tonal Containers (teal-aligned)
  primaryContainer: '#B2DFDB',
  onPrimaryContainer: '#0F4C5C',
  secondaryContainer: '#E0F2F1',
  onSecondaryContainer: '#1A202C',
  tertiaryContainer: '#E9D8FD',
  onTertiaryContainer: '#44337A',
  errorContainer: '#FED7D7',
  onErrorContainer: '#822727',
  surfaceVariant: '#EDF2F7',
};

const DarkPalette: ColorPalette = {
  // Brand — Brighter teal for dark mode contrast
  primary: '#38B2AC',
  primaryNavy: '#38B2AC',
  accentBlue: '#2DD4BF',         // Brighter teal accent
  accentBlueSoft: '#2DD4BF15',
  accentSecondary: '#2DD4BF',    // Progress, success
  
  // Surfaces — Navy, never pure black
  surface: '#1E293B',
  surfaceSecondary: '#0F172A',   // Main app background
  surfaceTertiary: '#334155',
  surfaceElevation1: '#1E293B',
  surfaceElevation2: '#283548',
  surfaceElevation3: '#334155',
  
  // Sidebar
  bgSidebar: '#0A2E3A',
  
  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  onPrimary: '#0F172A',
  onSurface: '#F1F5F9',
  
  // UI
  separator: '#334155',
  separatorOpaque: '#475569',
  border: '#334155',
  borderSubtle: '#334155',
  outline: '#64748B',
  outlineVariant: '#334155',
  
  // Shadows (stronger for dark mode)
  shadowCard: '0 4px 6px -1px rgba(0,0,0,0.3)',
  shadowFloat: '0 10px 15px -3px rgba(0,0,0,0.5)',
  
  // System
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Status
  success: '#2DD4BF',
  warning: '#F6E05E',
  error: '#FC8181',
  onError: '#0F172A',
  info: '#38B2AC',
  
  // Attendance
  present: '#2DD4BF',
  absent: '#FC8181',
  excused: '#F6E05E',

  // Compatibility
  background: '#0F172A',
  onSurfaceVariant: '#94A3B8',
  carryover: '#B794F4',
  accentBlueLegacy: '#38B2AC',
  
  // Tonal Containers (dark-adjusted teal)
  primaryContainer: '#134E5E',
  onPrimaryContainer: '#B2DFDB',
  secondaryContainer: '#1A3A4A',
  onSecondaryContainer: '#E0F2F1',
  tertiaryContainer: '#533D5E',
  onTertiaryContainer: '#E9D8FD',
  errorContainer: '#822727',
  onErrorContainer: '#FED7D7',
  surfaceVariant: '#283548',
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
