import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, Animated } from 'react-native';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
import * as LucideIcons from 'lucide-react-native';

interface SpaceTileProps {
  name: string;
  isAdd?: boolean;
  onPress?: () => void;
  index?: number;
  style?: ViewStyle;
}

/**
 * Space Tile — Teal design system
 * Teal-aligned tonal containers with smooth scale animations.
 */
export default React.memo(function SpaceTile({
  name,
  isAdd = false,
  onPress,
  index = 0,
  style,
}: SpaceTileProps) {
  const { colors: Colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const initials = name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Teal-centric gradient palette
  const TILE_COLORS = [
    { bg: '#0F4C5C', text: '#FFFFFF' },
    { bg: '#38B2AC', text: '#FFFFFF' },
    { bg: '#805AD5', text: '#FFFFFF' },
    { bg: '#2D3748', text: '#FFFFFF' },
  ];

  const tileColor = TILE_COLORS[index % TILE_COLORS.length];

  const getBackground = () => {
    if (isAdd) return Colors.surfaceVariant;
    return tileColor.bg;
  };

  const getTextColor = () => {
    if (isAdd) return Colors.textSecondary;
    return tileColor.text;
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          tileStyles.container,
          { backgroundColor: getBackground() },
          isAdd && { borderWidth: 1, borderColor: Colors.borderSubtle, borderStyle: 'dashed' as any }
        ]}
      >
        {isAdd ? (
          <View style={tileStyles.addContent}>
            <LucideIcons.Plus size={24} color={Colors.textSecondary} />
            <Text style={[tileStyles.addLabel, { color: Colors.textSecondary }]}>Join</Text>
          </View>
        ) : (
          <>
            <View style={[tileStyles.initialsContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={[tileStyles.initials, { color: getTextColor() }]}>{initials}</Text>
            </View>
            <Text style={[tileStyles.label, { color: getTextColor() }]} numberOfLines={2}>
              {name}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
});

const tileStyles = StyleSheet.create({
  container: {
    width: 100,
    height: 110,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addContent: {
    alignItems: 'center',
    gap: 4,
  },
  addLabel: {
    ...Typography.m3.labelSmall,
    fontWeight: '700',
  },
  initialsContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  initials: {
    ...Typography.m3.titleMedium,
    fontWeight: '800',
    letterSpacing: 1,
  },
  label: {
    ...Typography.m3.labelSmall,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
  },
});
