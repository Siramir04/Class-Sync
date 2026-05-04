// hooks/useTheme.ts
// System-aware theme hook for ClassSync
import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

import { ColorPalette } from '../constants/colors';
import { TypographyScale } from '../constants/typography';

interface Theme {
    colors: ColorPalette;
    typography: TypographyScale;
    isDark: boolean;
    scheme: 'light' | 'dark';
}

/**
 * Hook to access the current theme (colors and typography) 
 * based on the system color scheme.
 */
export const useTheme = (): Theme => {
    const systemScheme = useColorScheme(); // 'light' | 'dark' | null
    
    // Default to 'light' if not specified
    const scheme = systemScheme ?? 'light';

    return useMemo(() => {
        // Use the new semantic palettes
        const palette = scheme === 'dark' ? Colors.dark : Colors.light;
        
        return {
            colors: palette,
            typography: Typography,
            isDark: scheme === 'dark',
            scheme,
        };
    }, [scheme]);
};
