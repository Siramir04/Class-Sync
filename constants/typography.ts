// constants/typography.ts
// ClassSync typography system — teal remaster
// Supplement roles: appTitle, screenTitle, cardTitle, micro

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
  // New design-system roles
  appTitle: TextStyle;
  screenTitle: TextStyle;
  cardTitle: TextStyle;
  micro: TextStyle;

  // iOS Dynamic Type roles (preserved)
  largeTitle: TextStyle;
  title1: TextStyle;
  title2: TextStyle;
  title3: TextStyle;
  headline: TextStyle;
  body: TextStyle;
  callout: TextStyle;
  subHeader: TextStyle;
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

const family = {
  regular: 'DMSans_400Regular',
  semiBold: 'DMSans_500Medium',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
  extraBold: 'DMSans_700Bold',
};

const BaseTypography: Omit<TypographyScale, 'subHeader' | 'm3' | 'family' | 'appTitle' | 'screenTitle' | 'cardTitle' | 'micro'> = {
  largeTitle: { fontSize: 34, fontWeight: '700', lineHeight: 41, letterSpacing: 0.37 },
  title1: { fontSize: 28, fontWeight: '700', lineHeight: 34, letterSpacing: 0.36 },
  title2: { fontSize: 22, fontWeight: '700', lineHeight: 28, letterSpacing: 0.35 },
  title3: { fontSize: 20, fontWeight: '600', lineHeight: 25, letterSpacing: 0.38 },
  headline: { fontSize: 17, fontWeight: '600', lineHeight: 22, letterSpacing: -0.41 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 21, letterSpacing: -0.32 },
  callout: { fontSize: 16, fontWeight: '400', lineHeight: 21, letterSpacing: -0.32 },
  footnote: { fontSize: 13, fontWeight: '400', lineHeight: 18, letterSpacing: -0.08 },
  caption1: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
  caption2: { fontSize: 11, fontWeight: '400', lineHeight: 13, letterSpacing: 0.06 },
};

// Add new spec roles + legacy subHeader
const Typography: TypographyScale = {
  ...BaseTypography,

  // New design-system roles
  appTitle: { fontSize: 20, fontWeight: '700', lineHeight: 24, fontFamily: family.bold },
  screenTitle: { fontSize: 28, fontWeight: '700', lineHeight: 34, fontFamily: family.bold },
  cardTitle: { fontSize: 18, fontWeight: '600', lineHeight: 23, fontFamily: family.semiBold },
  micro: { fontSize: 10, fontWeight: '500', lineHeight: 12, fontFamily: family.medium },

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
