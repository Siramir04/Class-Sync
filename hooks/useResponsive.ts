// hooks/useResponsive.ts
// Responsive layout hook for web companion
import { useWindowDimensions } from 'react-native';

interface ResponsiveInfo {
    /** True when viewport width < 768px (phone-sized) */
    isMobile: boolean;
    /** True when viewport width >= 768px and < 1024px (tablet-sized) */
    isTablet: boolean;
    /** True when viewport width >= 1024px (desktop-sized) */
    isDesktop: boolean;
}

/**
 * Hook to detect viewport size category.
 * Used in root layout to constrain max width on desktop.
 */
export function useResponsive(): ResponsiveInfo {
    const { width } = useWindowDimensions();

    return {
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
    };
}
