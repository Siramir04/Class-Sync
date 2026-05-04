/**
 * Material 3 (M3) Typography System
 * Mapped to DM Sans for a modern, readable academic look.
 */

export const Typography = {
  family: {
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    semiBold: 'DMSans_600SemiBold',
    bold: 'DMSans_700Bold',
    extraBold: 'DMSans_800ExtraBold',
  },

  // Material 3 Scale
  m3: {
    displayLarge: {
      fontSize: 57,
      lineHeight: 64,
      fontFamily: 'DMSans_400Regular',
      letterSpacing: -0.25,
    },
    displayMedium: {
      fontSize: 45,
      lineHeight: 52,
      fontFamily: 'DMSans_400Regular',
      letterSpacing: 0,
    },
    displaySmall: {
      fontSize: 36,
      lineHeight: 44,
      fontFamily: 'DMSans_400Regular',
      letterSpacing: 0,
    },
    headlineLarge: {
      fontSize: 32,
      lineHeight: 40,
      fontFamily: 'DMSans_400Regular',
      letterSpacing: 0,
    },
    headlineMedium: {
      fontSize: 28,
      lineHeight: 36,
      fontFamily: 'DMSans_400Regular',
      letterSpacing: 0,
    },
    headlineSmall: {
      fontSize: 24,
      lineHeight: 32,
      fontFamily: 'DMSans_400Regular',
      letterSpacing: 0,
    },
    titleLarge: {
      fontSize: 22,
      lineHeight: 28,
      fontFamily: 'DMSans_500Medium',
      letterSpacing: 0,
    },
    titleMedium: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'DMSans_500Medium',
      letterSpacing: 0.15,
    },
    titleSmall: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'DMSans_500Medium',
      letterSpacing: 0.1,
    },
    labelLarge: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'DMSans_500Medium',
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'DMSans_500Medium',
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontSize: 11,
      lineHeight: 16,
      fontFamily: 'DMSans_500Medium',
      letterSpacing: 0.5,
    },
    bodyLarge: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'DMSans_400Regular',
      letterSpacing: 0.5,
    },
    bodyMedium: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'DMSans_400Regular',
      letterSpacing: 0.25,
    },
    bodySmall: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'DMSans_400Regular',
      letterSpacing: 0.4,
    },
  },

  // Legacy compatibility sizes (keeping to prevent immediate breakage)
  size: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    body: 15,
    title3: 16,
    title2: 18,
    title1: 22,
    largTitle: 28,
    display: 30,
  },
};
