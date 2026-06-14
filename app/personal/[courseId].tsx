import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { usePersonalCourseStore } from '../../store/personalCourseStore';
import { PersonalAttendanceRecord, PersonalAssignment, PersonalMaterial } from '../../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

type TabKey = 'schedule' | 'assignments' | 'materials' | 'attendance';

const TABS: { key: TabKey; label: string; icon: typeof LucideIcons.Calendar }[] = [
  { key: 'schedule', label: 'Schedule', icon: LucideIcons.Calendar },
  { key: 'assignments', label: 'Tasks', icon: LucideIcons.CheckSquare },
  { key: 'materials', label: 'Materials', icon: LucideIcons.FileText },
  { key: 'attendance', label: 'Attendance', icon: LucideIcons.UserCheck },
];

export default function PersonalCourseDetail() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: Colors, typography: Typography } = useTheme();
  const { courses, markAttendance, addAssignment, toggleAssignment, addMaterial, archiveCourse } = usePersonalCourseStore();

  const course = courses.find(c => c.id === courseId);
  const [activeTab, setActiveTab] = useState<TabKey>('schedule');

  // Add Assignment state
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentPriority, setNewAssignmentPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Add Material state
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialType, setNewMaterialType] = useState<'link' | 'note'>('note');
  const [newMaterialContent, setNewMaterialContent] = useState('');

  if (!course) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: Colors.background }]}>
        <LucideIcons.AlertCircle size={48} color={Colors.textTertiary} />
        <Text style={[styles.errorText, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>
          Course not found
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, fontFamily: Typography.family.semiBold }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleMarkAttendance = async (status: 'present' | 'absent' | 'excused') => {
    const record: Omit<PersonalAttendanceRecord, 'selfMarked'> = {
      id: Math.random().toString(36).slice(2),
      date: new Date(),
      status,
      durationMinutes: 60,
      notes: `Self-marked: ${status}`,
    };
    await markAttendance(courseId, record);
  };

  const handleAddAssignment = async () => {
    if (!newAssignmentTitle.trim()) return;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Default: 1 week from now
    await addAssignment(courseId, {
      title: newAssignmentTitle.trim(),
      dueDate,
      priority: newAssignmentPriority,
      isCompleted: false,
    });
    setNewAssignmentTitle('');
    setShowAddAssignment(false);
  };

  const handleAddMaterial = async () => {
    if (!newMaterialTitle.trim()) return;
    await addMaterial(courseId, {
      title: newMaterialTitle.trim(),
      type: newMaterialType,
      content: newMaterialType === 'note' ? newMaterialContent : undefined,
      url: newMaterialType === 'link' ? newMaterialContent : undefined,
    });
    setNewMaterialTitle('');
    setNewMaterialContent('');
    setShowAddMaterial(false);
  };

  const handleArchive = async () => {
    await archiveCourse(courseId);
    router.back();
  };

  const pendingAssignments = course.assignments.filter(a => !a.isCompleted);
  const completedAssignments = course.assignments.filter(a => a.isCompleted);

  const priorityColor = (p: string) => {
    switch (p) {
      case 'high': return Colors.error;
      case 'medium': return Colors.warning;
      default: return Colors.success;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Colored Header */}
      <View style={[styles.header, { backgroundColor: course.color, paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <LucideIcons.ArrowLeft size={22} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={handleArchive} style={styles.headerButton}>
            <LucideIcons.Archive size={20} color="#FFFFFFCC" />
          </Pressable>
        </View>
        <Text style={[styles.headerTitle, { fontFamily: Typography.family.bold }]}>
          {course.name}
        </Text>
        {course.description && (
          <Text style={[styles.headerSubtitle, { fontFamily: Typography.family.regular }]}>
            {course.description}
          </Text>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pendingAssignments.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: '#FFFFFF33' }]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{course.attendance.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: '#FFFFFF33' }]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{course.materials.length}</Text>
            <Text style={styles.statLabel}>Materials</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: Colors.surface, borderBottomColor: Colors.separatorOpaque }]}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, isActive && { borderBottomColor: course.color, borderBottomWidth: 2 }]}
            >
              <Icon size={18} color={isActive ? course.color : Colors.textTertiary} />
              <Text style={[styles.tabText, {
                color: isActive ? course.color : Colors.textTertiary,
                fontFamily: isActive ? Typography.family.semiBold : Typography.family.regular,
              }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ─── SCHEDULE TAB ─────────────────────── */}
        {activeTab === 'schedule' && (
          <View>
            {course.schedule.length === 0 ? (
              <View style={styles.emptyState}>
                <LucideIcons.Calendar size={40} color={Colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>
                  No Schedule Set
                </Text>
                <Text style={[styles.emptySubtitle, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
                  Add schedule items when creating or editing this course.
                </Text>
              </View>
            ) : (
              course.schedule.map(item => (
                <View key={item.id} style={[styles.scheduleItem, {
                  backgroundColor: Colors.surfaceSecondary,
                  borderLeftColor: course.color,
                }]}>
                  <View style={styles.scheduleItemHeader}>
                    <View style={[styles.dayBadge, { backgroundColor: course.color + '20' }]}>
                      <Text style={[styles.dayBadgeText, { color: course.color, fontFamily: Typography.family.bold }]}>
                        {DAYS[item.dayOfWeek]}
                      </Text>
                    </View>
                    <Text style={[styles.scheduleTime, { color: Colors.onSurface, fontFamily: Typography.family.semiBold }]}>
                      {item.startTime} – {item.endTime}
                    </Text>
                  </View>
                  {item.location && (
                    <View style={styles.scheduleLocation}>
                      <LucideIcons.MapPin size={13} color={Colors.textTertiary} />
                      <Text style={[styles.locationText, { color: Colors.textSecondary, fontFamily: Typography.family.regular }]}>
                        {item.location}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* ─── ASSIGNMENTS TAB ──────────────────── */}
        {activeTab === 'assignments' && (
          <View>
            {/* Add Assignment Form */}
            {showAddAssignment ? (
              <View style={[styles.addForm, { backgroundColor: Colors.surfaceSecondary, borderColor: Colors.separatorOpaque }]}>
                <TextInput
                  placeholder="Assignment title"
                  value={newAssignmentTitle}
                  onChangeText={setNewAssignmentTitle}
                  style={[styles.addFormInput, {
                    backgroundColor: Colors.surface,
                    color: Colors.textPrimary,
                    borderColor: Colors.separatorOpaque,
                    fontFamily: Typography.family.regular,
                  }]}
                  placeholderTextColor={Colors.textTertiary}
                  autoFocus
                />
                <View style={styles.priorityRow}>
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <Pressable
                      key={p}
                      onPress={() => setNewAssignmentPriority(p)}
                      style={[styles.priorityChip, {
                        backgroundColor: newAssignmentPriority === p ? priorityColor(p) + '20' : Colors.surface,
                        borderColor: newAssignmentPriority === p ? priorityColor(p) : Colors.separatorOpaque,
                      }]}
                    >
                      <Text style={[styles.priorityChipText, {
                        color: newAssignmentPriority === p ? priorityColor(p) : Colors.textSecondary,
                        fontFamily: Typography.family.semiBold,
                      }]}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.addFormActions}>
                  <Pressable onPress={() => setShowAddAssignment(false)}>
                    <Text style={{ color: Colors.textSecondary, fontFamily: Typography.family.semiBold }}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAddAssignment}
                    style={[styles.addFormSubmit, { backgroundColor: course.color }]}
                  >
                    <Text style={{ color: '#FFFFFF', fontFamily: Typography.family.bold }}>Add</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowAddAssignment(true)}
                style={[styles.addTrigger, { borderColor: Colors.separatorOpaque }]}
              >
                <LucideIcons.Plus size={18} color={Colors.primary} />
                <Text style={{ color: Colors.primary, fontFamily: Typography.family.semiBold }}>Add Assignment</Text>
              </Pressable>
            )}

            {/* Pending */}
            {pendingAssignments.length > 0 && (
              <View style={styles.assignmentSection}>
                <Text style={[styles.assignmentSectionTitle, { color: Colors.onSurfaceVariant, fontFamily: Typography.family.semiBold }]}>
                  Pending ({pendingAssignments.length})
                </Text>
                {pendingAssignments.map(a => (
                  <Pressable
                    key={a.id}
                    onPress={() => toggleAssignment(courseId, a.id)}
                    style={[styles.assignmentItem, { backgroundColor: Colors.surfaceSecondary }]}
                  >
                    <View style={[styles.checkbox, { borderColor: priorityColor(a.priority) }]} />
                    <View style={styles.assignmentInfo}>
                      <Text style={[styles.assignmentTitle, { color: Colors.onSurface, fontFamily: Typography.family.semiBold }]}>
                        {a.title}
                      </Text>
                      <Text style={[styles.assignmentDue, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
                        Due: {a.dueDate instanceof Date ? a.dueDate.toLocaleDateString() : new Date(a.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.priorityDot, { backgroundColor: priorityColor(a.priority) }]} />
                  </Pressable>
                ))}
              </View>
            )}

            {/* Completed */}
            {completedAssignments.length > 0 && (
              <View style={styles.assignmentSection}>
                <Text style={[styles.assignmentSectionTitle, { color: Colors.onSurfaceVariant, fontFamily: Typography.family.semiBold }]}>
                  Completed ({completedAssignments.length})
                </Text>
                {completedAssignments.map(a => (
                  <Pressable
                    key={a.id}
                    onPress={() => toggleAssignment(courseId, a.id)}
                    style={[styles.assignmentItem, { backgroundColor: Colors.surfaceSecondary, opacity: 0.6 }]}
                  >
                    <View style={[styles.checkbox, styles.checkboxChecked, { borderColor: Colors.success, backgroundColor: Colors.success }]}>
                      <LucideIcons.Check size={12} color="#FFFFFF" />
                    </View>
                    <View style={styles.assignmentInfo}>
                      <Text style={[styles.assignmentTitle, {
                        color: Colors.textTertiary,
                        textDecorationLine: 'line-through',
                        fontFamily: Typography.family.regular,
                      }]}>
                        {a.title}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {course.assignments.length === 0 && !showAddAssignment && (
              <View style={styles.emptyState}>
                <LucideIcons.Clipboard size={40} color={Colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>
                  No Assignments
                </Text>
                <Text style={[styles.emptySubtitle, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
                  Tap + to add your first assignment.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ─── MATERIALS TAB ───────────────────── */}
        {activeTab === 'materials' && (
          <View>
            {/* Add Material Form */}
            {showAddMaterial ? (
              <View style={[styles.addForm, { backgroundColor: Colors.surfaceSecondary, borderColor: Colors.separatorOpaque }]}>
                <TextInput
                  placeholder="Material title"
                  value={newMaterialTitle}
                  onChangeText={setNewMaterialTitle}
                  style={[styles.addFormInput, {
                    backgroundColor: Colors.surface,
                    color: Colors.textPrimary,
                    borderColor: Colors.separatorOpaque,
                    fontFamily: Typography.family.regular,
                  }]}
                  placeholderTextColor={Colors.textTertiary}
                  autoFocus
                />
                <View style={styles.priorityRow}>
                  {(['note', 'link'] as const).map(t => (
                    <Pressable
                      key={t}
                      onPress={() => setNewMaterialType(t)}
                      style={[styles.priorityChip, {
                        backgroundColor: newMaterialType === t ? course.color + '20' : Colors.surface,
                        borderColor: newMaterialType === t ? course.color : Colors.separatorOpaque,
                      }]}
                    >
                      <Text style={[styles.priorityChipText, {
                        color: newMaterialType === t ? course.color : Colors.textSecondary,
                        fontFamily: Typography.family.semiBold,
                      }]}>
                        {t === 'note' ? '📝 Note' : '🔗 Link'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  placeholder={newMaterialType === 'note' ? 'Note content...' : 'https://...'}
                  value={newMaterialContent}
                  onChangeText={setNewMaterialContent}
                  multiline={newMaterialType === 'note'}
                  style={[styles.addFormInput, {
                    backgroundColor: Colors.surface,
                    color: Colors.textPrimary,
                    borderColor: Colors.separatorOpaque,
                    fontFamily: Typography.family.regular,
                  }, newMaterialType === 'note' && { height: 80, textAlignVertical: 'top' }]}
                  placeholderTextColor={Colors.textTertiary}
                />
                <View style={styles.addFormActions}>
                  <Pressable onPress={() => setShowAddMaterial(false)}>
                    <Text style={{ color: Colors.textSecondary, fontFamily: Typography.family.semiBold }}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAddMaterial}
                    style={[styles.addFormSubmit, { backgroundColor: course.color }]}
                  >
                    <Text style={{ color: '#FFFFFF', fontFamily: Typography.family.bold }}>Add</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowAddMaterial(true)}
                style={[styles.addTrigger, { borderColor: Colors.separatorOpaque }]}
              >
                <LucideIcons.Plus size={18} color={Colors.primary} />
                <Text style={{ color: Colors.primary, fontFamily: Typography.family.semiBold }}>Add Material</Text>
              </Pressable>
            )}

            {course.materials.map(m => (
              <View key={m.id} style={[styles.materialItem, { backgroundColor: Colors.surfaceSecondary }]}>
                <View style={[styles.materialIcon, { backgroundColor: course.color + '15' }]}>
                  {m.type === 'note' ? (
                    <LucideIcons.FileText size={18} color={course.color} />
                  ) : m.type === 'link' ? (
                    <LucideIcons.Link size={18} color={course.color} />
                  ) : (
                    <LucideIcons.File size={18} color={course.color} />
                  )}
                </View>
                <View style={styles.materialInfo}>
                  <Text style={[styles.materialTitle, { color: Colors.onSurface, fontFamily: Typography.family.semiBold }]}>
                    {m.title}
                  </Text>
                  <Text style={[styles.materialMeta, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
                    {m.type.charAt(0).toUpperCase() + m.type.slice(1)} • {m.createdAt instanceof Date ? m.createdAt.toLocaleDateString() : new Date(m.createdAt).toLocaleDateString()}
                  </Text>
                  {m.content && (
                    <Text style={[styles.materialPreview, { color: Colors.textSecondary, fontFamily: Typography.family.regular }]} numberOfLines={2}>
                      {m.content}
                    </Text>
                  )}
                </View>
              </View>
            ))}

            {course.materials.length === 0 && !showAddMaterial && (
              <View style={styles.emptyState}>
                <LucideIcons.BookOpen size={40} color={Colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>
                  No Materials
                </Text>
                <Text style={[styles.emptySubtitle, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
                  Save links and notes for this course.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ─── ATTENDANCE TAB ──────────────────── */}
        {activeTab === 'attendance' && (
          <View>
            {/* Quick Mark Buttons */}
            <View style={[styles.attendanceActions, { backgroundColor: Colors.surfaceSecondary }]}>
              <Text style={[styles.attendancePrompt, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>
                Mark Today's Session
              </Text>
              <View style={styles.attendanceButtons}>
                <Pressable
                  onPress={() => handleMarkAttendance('present')}
                  style={[styles.attendanceBtn, { backgroundColor: Colors.success + '15' }]}
                >
                  <LucideIcons.Check size={18} color={Colors.success} />
                  <Text style={[styles.attendanceBtnText, { color: Colors.success, fontFamily: Typography.family.semiBold }]}>Present</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleMarkAttendance('absent')}
                  style={[styles.attendanceBtn, { backgroundColor: Colors.error + '15' }]}
                >
                  <LucideIcons.X size={18} color={Colors.error} />
                  <Text style={[styles.attendanceBtnText, { color: Colors.error, fontFamily: Typography.family.semiBold }]}>Absent</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleMarkAttendance('excused')}
                  style={[styles.attendanceBtn, { backgroundColor: Colors.warning + '15' }]}
                >
                  <LucideIcons.AlertCircle size={18} color={Colors.warning} />
                  <Text style={[styles.attendanceBtnText, { color: Colors.warning, fontFamily: Typography.family.semiBold }]}>Excused</Text>
                </Pressable>
              </View>
            </View>

            {/* Attendance History */}
            {course.attendance.length > 0 && (
              <View style={styles.attendanceHistory}>
                <Text style={[styles.assignmentSectionTitle, { color: Colors.onSurfaceVariant, fontFamily: Typography.family.semiBold }]}>
                  History ({course.attendance.length} sessions)
                </Text>
                {[...course.attendance].reverse().map(a => {
                  const statusIcon = a.status === 'present'
                    ? { icon: LucideIcons.CheckCircle, color: Colors.success }
                    : a.status === 'absent'
                      ? { icon: LucideIcons.XCircle, color: Colors.error }
                      : { icon: LucideIcons.AlertCircle, color: Colors.warning };
                  const StatusIcon = statusIcon.icon;
                  return (
                    <View key={a.id} style={[styles.attendanceRecord, { backgroundColor: Colors.surfaceSecondary }]}>
                      <StatusIcon size={20} color={statusIcon.color} />
                      <View style={styles.attendanceRecordInfo}>
                        <Text style={[styles.attendanceDate, { color: Colors.onSurface, fontFamily: Typography.family.semiBold }]}>
                          {a.date instanceof Date ? a.date.toLocaleDateString() : new Date(a.date).toLocaleDateString()}
                        </Text>
                        <Text style={[styles.attendanceMeta, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                          {a.durationMinutes ? ` • ${a.durationMinutes} min` : ''}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {course.attendance.length === 0 && (
              <View style={[styles.emptyState, { marginTop: 16 }]}>
                <LucideIcons.CheckCircle2 size={40} color={Colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>
                  No Sessions Recorded
                </Text>
                <Text style={[styles.emptySubtitle, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
                  Mark your first study session above.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
  },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Schedule
  scheduleItem: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  scheduleItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scheduleTime: {
    fontSize: 15,
    fontWeight: '600',
  },
  scheduleLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginLeft: 4,
  },
  locationText: {
    fontSize: 13,
  },
  // Assignments
  addTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addForm: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    gap: 12,
  },
  addFormInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
  },
  addFormSubmit: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  assignmentSection: {
    marginBottom: 20,
  },
  assignmentSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  assignmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderWidth: 0,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  assignmentDue: {
    fontSize: 12,
    marginTop: 2,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Materials
  materialItem: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  materialIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  materialMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  materialPreview: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  // Attendance
  attendanceActions: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  attendancePrompt: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  attendanceBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  attendanceHistory: {
    marginBottom: 20,
  },
  attendanceRecord: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  attendanceRecordInfo: {
    flex: 1,
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  attendanceMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  // Empty States
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
});
