import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, FlatList,
  StyleSheet, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { usePersonalCourseStore } from '../../store/personalCourseStore';
import { PersonalScheduleItem } from '../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

export default function CreatePersonalCourse() {
  const { colors: Colors, typography: Typography } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore(s => s.user);
  const { createCourse } = usePersonalCourseStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[4]); // Default blue
  const [scheduleItems, setScheduleItems] = useState<PersonalScheduleItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addScheduleItem = () => {
    setScheduleItems(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      dayOfWeek: 1 as const,
      startTime: '09:00',
      endTime: '11:00',
      location: '',
      reminderMinutes: 15,
    }]);
  };

  const updateScheduleItem = (id: string, updates: Partial<PersonalScheduleItem>) => {
    setScheduleItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeScheduleItem = (id: string) => {
    setScheduleItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCreate = async () => {
    if (!name.trim() || !user || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createCourse({
        ownerId: user.uid,
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        schedule: scheduleItems,
        assignments: [],
        materials: [],
        attendance: [],
      });
      router.back();
    } catch (err) {
      console.error('Failed to create personal course:', err);
      setIsSubmitting(false);
    }
  };

  const canSubmit = name.trim().length > 0 && !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: Colors.separatorOpaque }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <LucideIcons.ArrowLeft size={22} color={Colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>
          New Personal Course
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Course Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.onSurfaceVariant, fontFamily: Typography.family.semiBold }]}>
              Course Name
            </Text>
            <TextInput
              placeholder="e.g. Machine Learning, Piano Practice"
              value={name}
              onChangeText={setName}
              style={[styles.input, {
                backgroundColor: Colors.surfaceSecondary,
                color: Colors.textPrimary,
                borderColor: Colors.separatorOpaque,
                fontFamily: Typography.family.regular,
              }]}
              placeholderTextColor={Colors.textTertiary}
              autoFocus
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.onSurfaceVariant, fontFamily: Typography.family.semiBold }]}>
              Description (optional)
            </Text>
            <TextInput
              placeholder="What's this course about?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea, {
                backgroundColor: Colors.surfaceSecondary,
                color: Colors.textPrimary,
                borderColor: Colors.separatorOpaque,
                fontFamily: Typography.family.regular,
              }]}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          {/* Color Picker */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.onSurfaceVariant, fontFamily: Typography.family.semiBold }]}>
              Color
            </Text>
            <FlatList
              horizontal
              data={COLORS}
              keyExtractor={c => c}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setSelectedColor(item)}
                  style={[styles.colorSwatch, {
                    backgroundColor: item,
                    borderWidth: selectedColor === item ? 3 : 0,
                    borderColor: Colors.onSurface,
                    transform: [{ scale: selectedColor === item ? 1.15 : 1 }],
                  }]}
                >
                  {selectedColor === item && (
                    <LucideIcons.Check size={18} color="#FFFFFF" />
                  )}
                </Pressable>
              )}
              contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
            />
          </View>

          {/* Schedule */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionRow}>
              <Text style={[styles.label, { color: Colors.onSurfaceVariant, fontFamily: Typography.family.semiBold }]}>
                Weekly Schedule
              </Text>
              <Pressable onPress={addScheduleItem} style={[styles.addButton, { backgroundColor: Colors.primary + '15' }]}>
                <LucideIcons.Plus size={16} color={Colors.primary} />
                <Text style={[styles.addButtonText, { color: Colors.primary, fontFamily: Typography.family.semiBold }]}>
                  Add
                </Text>
              </Pressable>
            </View>

            {scheduleItems.length === 0 && (
              <View style={[styles.emptySchedule, { backgroundColor: Colors.surfaceSecondary, borderColor: Colors.separatorOpaque }]}>
                <LucideIcons.Calendar size={24} color={Colors.textTertiary} />
                <Text style={[styles.emptyText, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
                  No schedule items yet. Add your weekly class times.
                </Text>
              </View>
            )}

            {scheduleItems.map((item) => (
              <View key={item.id} style={[styles.scheduleCard, {
                backgroundColor: Colors.surfaceSecondary,
                borderColor: Colors.separatorOpaque,
              }]}>
                {/* Day Selector */}
                <View style={styles.dayRow}>
                  {DAYS.map((day, idx) => (
                    <Pressable
                      key={day}
                      onPress={() => updateScheduleItem(item.id, { dayOfWeek: idx as PersonalScheduleItem['dayOfWeek'] })}
                      style={[styles.dayChip, {
                        backgroundColor: item.dayOfWeek === idx ? selectedColor : Colors.surfaceTertiary,
                      }]}
                    >
                      <Text style={[styles.dayChipText, {
                        color: item.dayOfWeek === idx ? '#FFFFFF' : Colors.textSecondary,
                        fontFamily: Typography.family.semiBold,
                      }]}>
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Time Inputs */}
                <View style={styles.timeRow}>
                  <View style={styles.timeInput}>
                    <Text style={[styles.timeLabel, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>Start</Text>
                    <TextInput
                      value={item.startTime}
                      onChangeText={(v) => updateScheduleItem(item.id, { startTime: v })}
                      style={[styles.timeField, {
                        backgroundColor: Colors.surface,
                        color: Colors.textPrimary,
                        borderColor: Colors.separatorOpaque,
                        fontFamily: Typography.family.semiBold,
                      }]}
                      placeholder="09:00"
                      placeholderTextColor={Colors.textTertiary}
                      maxLength={5}
                    />
                  </View>
                  <LucideIcons.ArrowRight size={16} color={Colors.textTertiary} />
                  <View style={styles.timeInput}>
                    <Text style={[styles.timeLabel, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>End</Text>
                    <TextInput
                      value={item.endTime}
                      onChangeText={(v) => updateScheduleItem(item.id, { endTime: v })}
                      style={[styles.timeField, {
                        backgroundColor: Colors.surface,
                        color: Colors.textPrimary,
                        borderColor: Colors.separatorOpaque,
                        fontFamily: Typography.family.semiBold,
                      }]}
                      placeholder="11:00"
                      placeholderTextColor={Colors.textTertiary}
                      maxLength={5}
                    />
                  </View>
                </View>

                {/* Location */}
                <TextInput
                  value={item.location || ''}
                  onChangeText={(v) => updateScheduleItem(item.id, { location: v })}
                  placeholder="Location (optional)"
                  style={[styles.locationInput, {
                    backgroundColor: Colors.surface,
                    color: Colors.textPrimary,
                    borderColor: Colors.separatorOpaque,
                    fontFamily: Typography.family.regular,
                  }]}
                  placeholderTextColor={Colors.textTertiary}
                />

                {/* Remove */}
                <Pressable
                  onPress={() => removeScheduleItem(item.id)}
                  style={styles.removeButton}
                >
                  <LucideIcons.Delete size={16} color={Colors.error} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Create Button */}
      <View style={[styles.footer, {
        paddingBottom: insets.bottom + 16,
        backgroundColor: Colors.background,
        borderTopColor: Colors.separatorOpaque,
      }]}>
        <Pressable
          onPress={handleCreate}
          disabled={!canSubmit}
          style={[styles.createButton, {
            backgroundColor: canSubmit ? selectedColor : Colors.surfaceTertiary,
            opacity: canSubmit ? 1 : 0.5,
          }]}
        >
          {isSubmitting ? (
            <Text style={[styles.createButtonText, { fontFamily: Typography.family.bold }]}>Creating...</Text>
          ) : (
            <>
              <LucideIcons.Plus size={20} color="#FFFFFF" />
              <Text style={[styles.createButtonText, { fontFamily: Typography.family.bold }]}>Create Course</Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 88,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptySchedule: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 240,
  },
  scheduleCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  dayRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  timeField: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 15,
    textAlign: 'center',
    borderWidth: 1,
  },
  locationInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
