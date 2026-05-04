import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export type TagType = 
  | 'lecture' | 'assignment' | 'test' | 'note' | 'announcement' 
  | 'cancellation' | 'carryover' | 'monitor' | 'lecturer'
  | 'federal' | 'state' | 'private' | 'attendance';

interface TagProps {
  label: string;
  type?: TagType;
  style?: ViewStyle;
}

/**
 * Material 3 (M3) Tag / Filter Chip
 * Uses theme-aware tonal palettes and rounded stadium shapes.
 */
export const Tag = ({ label, type = 'lecture', style }: TagProps) => {
  const { colors: Colors, typography: Typography } = useTheme();

  const getM3Styles = (): { bg: string; text: string } => {
    switch (type) {
      case 'lecture':
      case 'monitor':
      case 'federal':
        return { bg: Colors.primaryContainer, text: Colors.onPrimaryContainer };
      case 'assignment':
      case 'note':
      case 'state':
        return { bg: Colors.secondaryContainer, text: Colors.onSecondaryContainer };
      case 'test':
      case 'cancellation':
        return { bg: Colors.errorContainer, text: Colors.onErrorContainer };
      case 'announcement':
      case 'carryover':
      case 'private':
        return { bg: Colors.tertiaryContainer, text: Colors.onTertiaryContainer };
      case 'attendance':
        return { bg: Colors.primaryContainer, text: Colors.primary };
      default:
        return { bg: Colors.surfaceVariant, text: Colors.onSurfaceVariant };
    }
  };

  const m3 = getM3Styles();

  return (
    <View style={[styles.container, { backgroundColor: m3.bg }, style]}>
      <Text style={[styles.text, { color: m3.text, ...Typography.m3.labelSmall }]}>
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8, // M3 Small component radius
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
