import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import * as LucideIcons from 'lucide-react-native';

interface ClassCardProps {
  courseCode: string;
  courseName: string;
  startTime: string;
  endTime: string;
  venue: string;
  isCarryover?: boolean;
  isAlarmSet?: boolean;
  alarmTime?: string;
  onPress?: () => void;
  onAlarmToggle?: () => void;
  style?: ViewStyle;
}

/**
 * Material 3 (M3) Class Card
 * Featuring large corner radii, tonal elevation, and smooth micro-interactions.
 */
export default function ClassCard({
  courseCode,
  courseName,
  startTime,
  endTime,
  venue,
  isCarryover = false,
  isAlarmSet = false,
  alarmTime,
  onPress,
  onAlarmToggle,
  style,
}: ClassCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const accentColor = isCarryover ? Colors.tertiary : Colors.primary;
  const containerBg = isCarryover ? Colors.tertiaryContainer : Colors.surfaceElevation1;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, { backgroundColor: containerBg }]}
      >
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: isCarryover ? Colors.onTertiary : Colors.onPrimary }]}>
             <Text style={[styles.courseCode, { color: accentColor }]}>{courseCode}</Text>
          </View>
          {isCarryover && (
            <View style={styles.carryoverTag}>
              <Text style={styles.carryoverText}>CO</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.courseName} numberOfLines={2}>{courseName}</Text>

          <View style={styles.detailsGroup}>
            <View style={styles.infoRow}>
              <LucideIcons.Clock size={12} color={Colors.onSurfaceVariant} />
              <Text style={styles.infoText}>{startTime} – {endTime}</Text>
            </View>

            <View style={styles.infoRow}>
              <LucideIcons.MapPin size={12} color={Colors.onSurfaceVariant} />
              <Text style={styles.infoText} numberOfLines={1}>{venue}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onAlarmToggle?.();
              }}
              style={({ pressed }) => [
                styles.alarmButton,
                isAlarmSet ? {
                  backgroundColor: Colors.primary,
                } : {
                  backgroundColor: Colors.surfaceElevation3,
                },
                pressed && { opacity: 0.8 }
              ]}
            >
              <LucideIcons.Bell
                size={14}
                color={isAlarmSet ? Colors.onPrimary : Colors.onSurfaceVariant}
                fill={isAlarmSet ? Colors.onPrimary : 'transparent'}
              />
              <Text style={[
                styles.alarmText,
                { color: isAlarmSet ? Colors.onPrimary : Colors.onSurfaceVariant }
              ]}>
                {isAlarmSet ? (alarmTime || 'Set') : 'Notify'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 170,
    height: 190,
    borderRadius: 28, // M3 Extra Large Corners
    padding: 16,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  courseCode: {
    ...Typography.m3.labelSmall,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  carryoverTag: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  carryoverText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.tertiary,
  },
  content: {
    flex: 1,
    marginTop: 12,
  },
  courseName: {
    ...Typography.m3.titleSmall,
    color: Colors.onSurface,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailsGroup: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    ...Typography.m3.labelSmall,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  actionRow: {
    marginTop: 'auto',
    paddingTop: 12,
  },
  alarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100, // Stadium button
  },
  alarmText: {
    ...Typography.m3.labelSmall,
    fontWeight: '700',
  },
});
