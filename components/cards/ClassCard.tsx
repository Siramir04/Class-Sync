import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, Animated, Platform } from 'react-native';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
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

  // Mockup alignment props
  isFeatured?: boolean;
  description?: string;
  traineesCount?: number;
  materialsCount?: number;
  instructorName?: string;
  instructorAvatar?: string;
  traineeAvatars?: string[];
  progress?: { completed: number; inProgress: number; pending: number };
}

// Default initials/colors for trainee circles in mockup
const TRAINEE_MOCKS = [
  { text: 'J', bg: '#0F4C5C' },
  { text: 'G', bg: '#38B2AC' },
  { text: 'T', bg: '#ECC94B' },
  { text: 'M', bg: '#4A5568' },
  { text: 'S', bg: '#A0AEC0' },
];

export default React.memo(function ClassCard({
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

  isFeatured = false,
  description,
  traineesCount,
  materialsCount,
  instructorName,
  instructorAvatar,
  progress,
}: ClassCardProps) {
  const { colors: Colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const totalTraineesText = traineesCount ? `${traineesCount} Trainees` : '';
  const materialsText = materialsCount ? `${materialsCount} Materials` : '';
  const accentColor = isCarryover ? Colors.carryover : Colors.accentSecondary;

  // Glassmorphic styling
  const cardBg = isDark 
    ? 'rgba(30, 41, 59, 0.55)' 
    : 'rgba(255, 255, 255, 0.75)';

  const cardBorder = isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(15, 76, 92, 0.08)';

  if (isFeatured) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.featuredWrapper, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.featuredContainer,
            {
              backgroundColor: cardBg,
              borderColor: cardBorder,
            },
            Platform.OS === 'web' && {
              // @ts-ignore
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }
          ]}
        >


          {/* Top Row: Info & Options */}
          <View style={styles.topRow}>
            <Text style={[styles.headerMeta, { color: Colors.textSecondary }]}>
              {totalTraineesText}{totalTraineesText && materialsText ? '   |   ' : ''}{materialsText}
            </Text>
            <View style={styles.topRightControls}>
              <View style={[styles.statusIndicator, { backgroundColor: Colors.accentSecondary }]} />
              <LucideIcons.MoreVertical size={16} color={Colors.textSecondary} />
            </View>
          </View>

          {/* Main Title & Description */}
          <View style={styles.mainContent}>
            <Text style={[styles.featuredTitle, { color: Colors.textPrimary }]} numberOfLines={1}>
              {courseName}
            </Text>
            {description && (
              <Text style={[styles.featuredDescription, { color: Colors.textSecondary }]} numberOfLines={2}>
                {description}
              </Text>
            )}
          </View>

          {/* Bottom Row: Progress, Trainees Stack, Instructor */}
          <View style={styles.bottomRow}>
            {/* Progress Column */}
            {progress && (
              <View style={styles.bottomCol}>
                <Text style={[styles.bottomColLabel, { color: Colors.textTertiary }]}>Class Progress</Text>
                <View style={styles.progressPillsRow}>
                  <View style={[styles.progressPill, { backgroundColor: 'rgba(56, 178, 172, 0.15)' }]}>
                    <View style={[styles.pillDot, { backgroundColor: Colors.accentSecondary }]} />
                    <Text style={[styles.pillText, { color: Colors.accentSecondary }]}>{progress.completed}</Text>
                  </View>
                  <View style={[styles.progressPill, { backgroundColor: 'rgba(236, 201, 75, 0.15)' }]}>
                    <View style={[styles.pillDot, { backgroundColor: '#ECC94B' }]} />
                    <Text style={[styles.pillText, { color: '#ECC94B' }]}>{progress.inProgress}</Text>
                  </View>
                  <View style={[styles.progressPill, { backgroundColor: 'rgba(160, 174, 192, 0.15)' }]}>
                    <View style={[styles.pillDot, { backgroundColor: '#A0AEC0' }]} />
                    <Text style={[styles.pillText, { color: '#A0AEC0' }]}>{progress.pending}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Trainees Stack Column */}
            {traineesCount ? (
              <View style={styles.bottomCol}>
                <Text style={[styles.bottomColLabel, { color: Colors.textTertiary }]}>Trainees</Text>
                <View style={styles.avatarStack}>
                  {TRAINEE_MOCKS.map((t, idx) => (
                    <View key={idx} style={[styles.stackAvatarCircle, { backgroundColor: t.bg, zIndex: 10 - idx }]}>
                      <Text style={styles.stackAvatarText}>{t.text}</Text>
                    </View>
                  ))}
                  <View style={[styles.stackAvatarCircle, { backgroundColor: Colors.accentSecondary, zIndex: 0 }]}>
                    <Text style={styles.stackAvatarText}>+{Math.max(0, traineesCount - 5)}</Text>
                  </View>
                </View>
              </View>
            ) : <View style={styles.bottomCol} />}

            {/* Instructor Column */}
            {instructorName && (
              <View style={styles.bottomCol}>
                <Text style={[styles.bottomColLabel, { color: Colors.textTertiary }]}>Instructor</Text>
                <View style={styles.instructorRow}>
                  <View style={[styles.instructorAvatarCircle, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.instructorAvatarText}>
                      {instructorName.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[styles.instructorName, { color: Colors.textPrimary }]} numberOfLines={1}>
                    {instructorName}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Standard Compact Card Layout
  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.compactWrapper, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.compactContainer,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
          },
          Platform.OS === 'web' && {
            // @ts-ignore
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }
        ]}
      >


        {/* Top Header */}
        <View style={styles.topRow}>
          <Text style={[styles.headerMeta, { color: Colors.textSecondary }]}>
            {traineesCount ? `${traineesCount} Trainees` : venue} {materialsCount ? `| ${materialsCount} Mat` : ''}
          </Text>
          <View style={styles.topRightControls}>
            <View style={[styles.statusIndicator, { backgroundColor: Colors.accentSecondary }]} />
            <LucideIcons.MoreVertical size={14} color={Colors.textSecondary} />
          </View>
        </View>

        {/* Title */}
        <View style={styles.compactContent}>
          <Text style={[styles.compactTitle, { color: Colors.textPrimary }]} numberOfLines={2}>
            {courseName}
          </Text>
        </View>

        {/* Bottom Details Group */}
        <View style={styles.compactBottomRow}>
          {/* Progress Bars */}
          <View style={styles.compactCol}>
            <Text style={[styles.bottomColLabel, { color: Colors.textTertiary }]}>Class Progress</Text>
            <View style={styles.compactProgressBarRow}>
              <View style={[styles.progressSegment, { backgroundColor: Colors.accentSecondary, flex: 2 }]} />
              <View style={[styles.progressSegment, { backgroundColor: '#ECC94B', flex: 1 }]} />
              <View style={[styles.progressSegment, { backgroundColor: 'rgba(160, 174, 192, 0.3)', flex: 3 }]} />
            </View>
          </View>

          {/* Trainees Stack */}
          {traineesCount ? (
            <View style={styles.compactColRight}>
              <Text style={[styles.bottomColLabel, { color: Colors.textTertiary }]}>Trainees</Text>
              <View style={styles.avatarStackCompact}>
                <View style={[styles.stackAvatarCircleCompact, { backgroundColor: '#0F4C5C', zIndex: 3 }]}>
                  <Text style={styles.stackAvatarTextCompact}>J</Text>
                </View>
                <View style={[styles.stackAvatarCircleCompact, { backgroundColor: '#38B2AC', zIndex: 2 }]}>
                  <Text style={styles.stackAvatarTextCompact}>G</Text>
                </View>
                <View style={[styles.stackAvatarCircleCompact, { backgroundColor: Colors.accentSecondary, zIndex: 0 }]}>
                  <Text style={styles.stackAvatarTextCompact}>+{Math.max(0, traineesCount - 2)}</Text>
                </View>
              </View>
            </View>
          ) : <View style={styles.compactColRight} />}
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  featuredWrapper: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  featuredContainer: {
    padding: 20,
    minHeight: 200,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  compactWrapper: {
    width: 250,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  compactContainer: {
    padding: 16,
    height: 185,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  codeOverlay: {
    position: 'absolute',
    right: -20,
    top: -10,
    bottom: -10,
    width: '45%',
    opacity: 0.85,
    pointerEvents: 'none',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 9.5,
    lineHeight: 13,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  headerMeta: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    letterSpacing: 0.1,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mainContent: {
    marginVertical: 12,
    zIndex: 2,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'DMSans_700Bold',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  featuredDescription: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'DMSans_400Regular',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    zIndex: 2,
  },
  bottomCol: {
    flex: 1,
  },
  bottomColLabel: {
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  progressPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackAvatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginLeft: -6,
  },
  stackAvatarText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructorAvatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instructorName: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
  compactContent: {
    marginVertical: 8,
    zIndex: 2,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    lineHeight: 22,
  },
  compactBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  compactCol: {
    flex: 1,
    paddingRight: 10,
  },
  compactColRight: {
    alignItems: 'flex-start',
  },
  compactProgressBarRow: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 2,
    marginTop: 2,
  },
  progressSegment: {
    height: '100%',
    borderRadius: 3,
  },
  avatarStackCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  stackAvatarCircleCompact: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginLeft: -5,
  },
  stackAvatarTextCompact: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
