import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
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
  const accentColor = isCarryover ? Colors.carryover : Colors.accentBlue;
  const accentSoft = isCarryover ? Colors.carryoverSoft : Colors.accentBlueSoft;

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        style,
        pressed && { transform: [{ scale: 0.98 }] }
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      
      <View style={styles.content}>
        <Text style={[styles.courseCode, { color: accentColor }]}>{courseCode}</Text>
        <Text style={styles.courseName} numberOfLines={2}>{courseName}</Text>

        <View style={styles.infoRow}>
          <LucideIcons.Clock size={9} color={Colors.textTertiary} />
          <Text style={styles.infoText}>{startTime} – {endTime}</Text>
        </View>

        <View style={[styles.infoRow, { marginTop: 2 }]}>
          <LucideIcons.MapPin size={9} color={Colors.textTertiary} />
          <Text style={styles.infoText}>{venue}</Text>
        </View>

        <View style={styles.alarmSection}>
          <Pressable 
            onPress={onAlarmToggle}
            style={[
              styles.alarmButton,
              isAlarmSet ? { 
                borderColor: Colors.accentBlue, 
                backgroundColor: Colors.accentBlueSoft 
              } : { 
                borderColor: Colors.separatorOpaque, 
                backgroundColor: Colors.background 
              },
              isCarryover && !isAlarmSet && { 
                borderColor: Colors.carryoverSoft 
              }
            ]}
          >
            <LucideIcons.Bell 
              size={10} 
              color={isAlarmSet ? Colors.accentBlue : isCarryover ? Colors.carryover : Colors.textTertiary} 
              fill={isAlarmSet ? Colors.accentBlue : 'transparent'}
            />
            <Text style={[
              styles.alarmText, 
              { color: isAlarmSet ? Colors.accentBlue : isCarryover ? Colors.carryover : Colors.textTertiary }
            ]}>
              {isAlarmSet ? (alarmTime || 'Set') : 'Set alarm'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.separatorOpaque,
    overflow: 'hidden',
    paddingTop: 13,
    paddingRight: 13,
    paddingBottom: 10,
    paddingLeft: 13,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    paddingLeft: 8,
  },
  courseCode: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 2,
    fontFamily: Typography.family.bold,
  },
  courseName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    lineHeight: 12 * 1.3,
    marginBottom: 7,
    fontFamily: Typography.family.bold,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  infoText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: Typography.family.regular,
  },
  alarmSection: {
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  alarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  alarmText: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: Typography.family.semiBold,
  },
});
