import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';

interface SpaceTileProps {
  name: string;
  isAdd?: boolean;
  onPress?: () => void;
  index?: number;
  style?: ViewStyle;
}

export default function SpaceTile({
  name,
  isAdd = false,
  onPress,
  index = 0,
  style,
}: SpaceTileProps) {
  const getBackground = () => {
    if (isAdd) return 'white';
    if (index === 0) return Colors.primaryNavy;
    if (index === 1) return '#0F172A';
    return Colors.accentBlue;
  };

  const initials = name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isAdd) {
    return (
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          styles.addTile,
          style,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
        ]}
      >
        <Text style={styles.addIcon}>+</Text>
      </Pressable>
    );
  }

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: getBackground() },
        style,
        pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
      ]}
    >
      <Text style={styles.initials}>{initials}</Text>
      <Text style={styles.label} numberOfLines={2}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 90,
    height: 90,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: Colors.separatorOpaque,
    borderStyle: 'dashed',
  },
  addIcon: {
    fontSize: 22,
    color: Colors.textTertiary,
  },
  initials: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: Typography.family.bold,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 9 * 1.2,
    fontFamily: Typography.family.semiBold,
  },
});
