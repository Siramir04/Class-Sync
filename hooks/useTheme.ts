// hooks/useTheme.ts
// Theme hook with manual override support
// Follows device color scheme by default; manual toggle overrides
import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { useThemeStore } from '../store/themeStore';

import { ColorPalette } from '../constants/colors';
import { TypographyScale } from '../constants/typography';

interface Theme {
    colors: ColorPalette;
    typography: TypographyScale;
    isDark: boolean;
    scheme: 'light' | 'dark';
    themeMode: 'system' | 'light' | 'dark';
    toggleTheme: () => void;
    setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
}

/**
 * Hook to access the current theme (colors and typography).
 * Follows device color scheme by default.
 * Manual toggle overrides via themeStore.
 */
export const useTheme = (): Theme => {
    const systemScheme = useColorScheme(); // 'light' | 'dark' | null
    const { mode, toggleMode, setMode } = useThemeStore();
    
    // Resolve effective scheme: manual override or system
    const effectiveScheme = mode === 'system' 
        ? (systemScheme ?? 'light') 
        : mode;

    return useMemo(() => {
        const palette = effectiveScheme === 'dark' ? Colors.dark : Colors.light;
        
        return {
            colors: palette,
            typography: Typography,
            isDark: effectiveScheme === 'dark',
            scheme: effectiveScheme,
            themeMode: mode,
            toggleTheme: toggleMode,
            setThemeMode: setMode,
        };
    }, [effectiveScheme, mode, toggleMode, setMode]);
};
