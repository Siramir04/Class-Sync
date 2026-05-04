// constants/typography.ts
// iOS Dynamic Type-aligned typography system

type ColorScheme = 'light' | 'dark';

interface TextStyle {
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700' | '800' | '900';
  lineHeight: number;
  letterSpacing?: number;
  color?: string; // Optional — falls back to textPrimary via hook
  fontFamily?: string;
}

interface TypographyScale {
  largeTitle: TextStyle;
  title1: TextStyle;
  title2: TextStyle;
  title3: TextStyle;
  headline: TextStyle;
  body: TextStyle;
  callout: TextStyle;
  subHeader: TextStyle;        // ← FIXES tracker.tsx:126
  footnote: TextStyle;
  caption1: TextStyle;
  caption2: TextStyle;
  // Legacy support for M3 structure
  m3: {
    titleLarge: TextStyle;
    titleMedium: TextStyle;
    headlineMedium: TextStyle;
    bodyLarge: TextStyle;
    bodyMedium: TextStyle;
    labelLarge: TextStyle;
    labelSmall: TextStyle;
  };
  family: {
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
    extraBold: string;
  };
}

const BaseTypography: Omit<TypographyScale, 'subHeader' | 'm3' | 'family'> = {
  largeTitle: { fontSize: 34, fontWeight: '700', lineHeight: 41, letterSpacing: 0.37 },
  title1: { fontSize: 28, fontWeight: '700', lineHeight: 34, letterSpacing: 0.36 },
  title2: { fontSize: 22, fontWeight: '700', lineHeight: 28, letterSpacing: 0.35 },
  title3: { fontSize: 20, fontWeight: '600', lineHeight: 25, letterSpacing: 0.38 },
  headline: { fontSize: 17, fontWeight: '600', lineHeight: 22, letterSpacing: -0.41 },
  body: { fontSize: 17, fontWeight: '400', lineHeight: 22, letterSpacing: -0.41 },
  callout: { fontSize: 16, fontWeight: '400', lineHeight: 21, letterSpacing: -0.32 },
  footnote: { fontSize: 13, fontWeight: '400', lineHeight: 18, letterSpacing: -0.08 },
  caption1: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  caption2: { fontSize: 11, fontWeight: '400', lineHeight: 13, letterSpacing: 0.06 },
};

const family = {
  regular: 'DMSans_400Regular',
  semiBold: 'DMSans_500Medium',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
  extraBold: 'DMSans_700Bold',
};

// Add subHeader — semantically between callout and headline, used for section labels
const Typography: TypographyScale = {
  ...BaseTypography,
  subHeader: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  family,
  m3: {
    titleLarge: { fontSize: 22, fontWeight: '700', lineHeight: 28, fontFamily: family.bold },
    titleMedium: { fontSize: 16, fontWeight: '600', lineHeight: 24, fontFamily: family.semiBold },
    headlineMedium: { fontSize: 28, fontWeight: '700', lineHeight: 36, fontFamily: family.bold },
    bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24, fontFamily: family.regular },
    bodyMedium: { fontSize: 14, fontWeight: '400', lineHeight: 20, fontFamily: family.regular },
    labelLarge: { fontSize: 14, fontWeight: '600', lineHeight: 20, fontFamily: family.semiBold },
    labelSmall: { fontSize: 11, fontWeight: '500', lineHeight: 16, fontFamily: family.semiBold },
  }
};

export { Typography };
export type { TextStyle, TypographyScale };
