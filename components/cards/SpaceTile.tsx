import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import * as LucideIcons from 'lucide-react-native';

interface SpaceTileProps {
  name: string;
  isAdd?: boolean;
  onPress?: () => void;
  index?: number;
  style?: ViewStyle;
}

/**
 * Material 3 (M3) Space Tile
 * Using tonal containers and smooth scale animations.
 */
export default React.memo(function SpaceTile({
  name,
  isAdd = false,
  onPress,
  index = 0,
  style,
}: SpaceTileProps) {
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

  const getBackground = () => {
    if (isAdd) return Colors.surfaceElevation1;
    // Tonal cycling for M3 variety
    const colors = [Colors.primaryContainer, Colors.secondaryContainer, Colors.surfaceElevation3];
    return colors[index % colors.length];
  };

  const getTextColor = () => {
    if (isAdd) return Colors.onSurfaceVariant;
    const colors = [Colors.onPrimaryContainer, Colors.onSecondaryContainer, Colors.onSurface];
    return colors[index % colors.length];
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          { backgroundColor: getBackground() },
          isAdd && styles.addTile
        ]}
      >
        {isAdd ? (
          <View style={styles.addContent}>
            <LucideIcons.Plus size={24} color={Colors.onSurfaceVariant} />
            <Text style={styles.addLabel}>Join</Text>
          </View>
        ) : (
          <>
            <View style={[styles.initialsContainer, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
              <Text style={[styles.initials, { color: getTextColor() }]}>{initials}</Text>
            </View>
            <Text style={[styles.label, { color: getTextColor() }]} numberOfLines={2}>
              {name}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 110,
    borderRadius: 24, // M3 Large radius
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
  },
  addContent: {
    alignItems: 'center',
    gap: 4,
  },
  addLabel: {
    ...Typography.m3.labelSmall,
    color: Colors.onSurfaceVariant,
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
