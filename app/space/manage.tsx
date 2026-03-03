import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Share,
    TextInput,
    FlatList,
    Modal,
    Pressable,
    Switch,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useCourses } from '../../hooks/useCourses';
import { getSpaceById, updateSpace, deleteSpace, transferOwnership, getSpaceMembers, removeSpaceMember, promoteToAssistantMonitor } from '../../services/spaceService';
import { assignLecturer } from '../../services/courseService';
import { getAttendanceSettings, updateCourseAttendanceSettings } from '../../services/attendanceService';
import { CourseAttendanceSettings } from '../../types/attendance';
import Card from '../../components/ui/Card';
import Tag from '../../components/ui/Tag';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Divider from '../../components/ui/Divider';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Space, CourseMember, Course } from '../../types';

export default function SpaceManageScreen() {
    const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
    const router = useRouter();
    const { user } = useAuthStore();

    const [space, setSpace] = useState<Space | null>(null);
    const [members, setMembers] = useState<CourseMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [spaceName, setSpaceName] = useState('');
    const { courses } = useCourses(spaceId || null);

    useEffect(() => {
        loadData();
    }, [spaceId]);

    const loadData = async () => {
        if (!spaceId) return;
        setLoading(true);
        try {
            const [spaceData, membersData] = await Promise.all([
                getSpaceById(spaceId),
                getSpaceMembers(spaceId),
            ]);
            setSpace(spaceData);
            setSpaceName(spaceData?.name || '');
            setMembers(membersData);
        } catch (error) {
            console.error('Error loading space management data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDetails = async () => {
        if (!spaceId || !spaceName.trim()) return;
        try {
            await updateSpace(spaceId, { name: spaceName.trim() });
            Alert.alert('Saved', 'Space details updated.');
        } catch {
            Alert.alert('Error', 'Could not update space.');
        }
    };

    const handleShareCode = async () => {
        if (!space) return;
        await Share.share({ message: `Join my class on ClassSync! Code: ${space.spaceCode}` });
    };

    const handleDeleteSpace = () => {
        Alert.alert('Delete Space', 'This action cannot be undone. All data will be lost.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteSpace(spaceId!);
                        router.replace('/(tabs)/spaces');
                    } catch {
                        Alert.alert('Error', 'Could not delete space.');
                    }
                },
            },
        ]);
    };

    const handleRemoveMember = (uid: string) => {
        Alert.alert('Remove Member', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    await removeSpaceMember(spaceId!, uid);
                    loadData();
                },
            },
        ]);
    };

    const handlePromote = async (uid: string) => {
        await promoteToAssistantMonitor(spaceId!, uid);
        loadData();
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Space</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Space Details */}
                <Text style={styles.sectionTitle}>Space Details</Text>
                <Input label="Space Name" value={spaceName} onChangeText={setSpaceName} />
                <Button title="Save Changes" onPress={handleSaveDetails} variant="secondary" />

                <Divider />

                {/* Courses */}
                <Text style={styles.sectionTitle}>Courses</Text>
                {courses.map((course) => (
                    <CourseCardWithAttendance
                        key={course.id}
                        course={course}
                        spaceId={spaceId!}
                    />
                ))}

                <Divider />

                {/* Members */}
                <Text style={styles.sectionTitle}>Members</Text>
                {members.map((member) => (
                    <TouchableOpacity
                        key={member.uid}
                        style={styles.memberRow}
                        onPress={() => {
                            if (member.uid === user?.uid) return;
                            Alert.alert('Member Options', '', [
                                { text: 'Promote to Assistant Monitor', onPress: () => handlePromote(member.uid) },
                                { text: 'Remove from Space', style: 'destructive', onPress: () => handleRemoveMember(member.uid) },
                                { text: 'Cancel', style: 'cancel' },
                            ]);
                        }}
                    >
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberUid}>{member.uid}</Text>
                            <Tag label={member.role} variant="role" />
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={Colors.border} />
                    </TouchableOpacity>
                ))}

                <Divider />

                {/* Join Code */}
                <Text style={styles.sectionTitle}>Join Code</Text>
                <View style={styles.codeDisplay}>
                    <Text style={styles.codeText}>{space?.spaceCode}</Text>
                </View>
                <View style={styles.codeActions}>
                    <Button title="Copy Code" onPress={() => { }} variant="secondary" fullWidth={false} style={{ flex: 1, marginRight: 8 }} />
                    <Button title="Share" onPress={handleShareCode} variant="primary" fullWidth={false} style={{ flex: 1 }} />
                </View>

                <Divider />

                {/* Danger Zone */}
                <Text style={[styles.sectionTitle, { color: Colors.error }]}>Danger Zone</Text>
                <Button
                    title="Transfer Ownership"
                    onPress={() => Alert.alert('Transfer', 'Select a member to transfer ownership to.')}
                    variant="secondary"
                    style={{ marginBottom: Spacing.md }}
                />
                <Button
                    title="Delete Space"
                    onPress={handleDeleteSpace}
                    variant="danger"
                />

                <View style={{ height: Spacing.xxl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function CourseCardWithAttendance({ course, spaceId }: { course: Course, spaceId: string }) {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAttendanceSettings(course.id, spaceId)
            .then((settings: CourseAttendanceSettings) => setEnabled(settings.isEnabled))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [course.id, spaceId]);

    const toggleAttendance = async (value: boolean) => {
        try {
            await updateCourseAttendanceSettings(course.id, spaceId, { isEnabled: value });
            setEnabled(value);
        } catch (error) {
            Alert.alert('Error', 'Failed to update attendance settings');
        }
    };

    return (
        <Card style={styles.courseCard}>
            <View style={styles.courseHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.courseName}>{course.courseName}</Text>
                    <Text style={styles.courseCode}>{course.fullCode}</Text>
                </View>
                <View style={styles.attendanceToggle}>
                    <Text style={styles.toggleLabel}>Attendance</Text>
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.primaryBlue} />
                    ) : (
                        <Switch
                            value={enabled}
                            onValueChange={toggleAttendance}
                            trackColor={{ false: Colors.border, true: Colors.primaryBlue + '80' }}
                            thumbColor={enabled ? Colors.primaryBlue : '#f4f3f4'}
                        />
                    )}
                </View>
            </View>
            <Text style={styles.lecturerName}>
                {course.lecturerName || 'No Lecturer assigned'}
            </Text>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
    },
    content: {
        padding: Spacing.screenPadding,
    },
    sectionTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    courseCard: {
        marginBottom: Spacing.sm,
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    attendanceToggle: {
        alignItems: 'center',
    },
    toggleLabel: {
        ...Typography.label,
        fontSize: 10,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    courseName: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
    },
    courseCode: {
        ...Typography.codeDisplay,
        color: Colors.accentBlue,
        marginTop: 4,
    },
    lecturerName: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '30',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    memberUid: {
        ...Typography.body,
        color: Colors.textPrimary,
        flex: 1,
    },
    codeDisplay: {
        backgroundColor: Colors.subtleFill,
        borderRadius: Spacing.cardRadius,
        padding: Spacing.lg,
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    codeText: {
        ...Typography.codeDisplay,
        color: Colors.accentBlue,
        fontSize: 24,
        letterSpacing: 2,
    },
    codeActions: {
        flexDirection: 'row',
        gap: 8,
    },
});
