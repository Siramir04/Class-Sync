// hooks/useAdaptiveTypography.ts
// Returns desktop-optimized typography scale when on desktop, unmodified on mobile
import { useMemo } from 'react';
import { Typography, TypographyScale, TextStyle } from '../constants/typography';
import { useResponsive } from './useResponsive';

/**
 * Scale a TextStyle for desktop readability:
 * - Reduce large font sizes slightly (mobile fonts look oversized on desktop)
 * - Increase line height for comfortable reading on larger screens
 */
function scaleForDesktop(style: TextStyle, sizeReduction: number = 0, lineHeightBump: number = 0.15): TextStyle {
    const adjustedSize = Math.max(style.fontSize - sizeReduction, 11);
    const adjustedLineHeight = Math.round(style.lineHeight * (1 + lineHeightBump));

    return {
        ...style,
        fontSize: adjustedSize,
        lineHeight: adjustedLineHeight,
    };
}

/**
 * Hook that returns an adaptive typography scale.
 * On desktop: slightly smaller headlines, increased line heights for readability.
 * On mobile: returns the unmodified Typography scale.
 */
export function useAdaptiveTypography(): TypographyScale {
    const { isDesktop } = useResponsive();

    return useMemo(() => {
        if (!isDesktop) return Typography;

        return {
            ...Typography,
            // Scale down large titles for desktop
            largeTitle: scaleForDesktop(Typography.largeTitle, 4, 0.1),    // 34 → 30
            title1: scaleForDesktop(Typography.title1, 2, 0.1),            // 28 → 26
            title2: scaleForDesktop(Typography.title2, 1, 0.1),            // 22 → 21
            title3: scaleForDesktop(Typography.title3, 1, 0.1),            // 20 → 19

            // Body text: keep sizes but increase line height
            headline: scaleForDesktop(Typography.headline, 0, 0.12),
            body: scaleForDesktop(Typography.body, 0, 0.15),
            callout: scaleForDesktop(Typography.callout, 0, 0.12),
            subHeader: scaleForDesktop(Typography.subHeader, 0, 0.12),
            footnote: scaleForDesktop(Typography.footnote, 0, 0.1),
            caption1: scaleForDesktop(Typography.caption1, 0, 0.1),
            caption2: scaleForDesktop(Typography.caption2, 0, 0.1),

            // M3 styles for desktop
            m3: {
                titleLarge: scaleForDesktop(Typography.m3.titleLarge, 2, 0.1),   // 22 → 20
                titleMedium: scaleForDesktop(Typography.m3.titleMedium, 0, 0.1),
                headlineMedium: scaleForDesktop(Typography.m3.headlineMedium, 4, 0.1), // 28 → 24
                bodyLarge: scaleForDesktop(Typography.m3.bodyLarge, 0, 0.15),
                bodyMedium: scaleForDesktop(Typography.m3.bodyMedium, 0, 0.15),
                labelLarge: scaleForDesktop(Typography.m3.labelLarge, 0, 0.1),
                labelSmall: scaleForDesktop(Typography.m3.labelSmall, 0, 0.1),
            },

            // Font families remain unchanged
            family: Typography.family,
        };
    }, [isDesktop]);
}
