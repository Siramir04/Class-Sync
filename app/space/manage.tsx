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
    Switch,
    ActivityIndicator,
    Platform,
    Clipboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useCourses } from '../../hooks/useCourses';
import { 
    getSpaceById, 
    updateSpace, 
    deleteSpace, 
    getSpaceMembers, 
    removeSpaceMember, 
    promoteToAssistantMonitor 
} from '../../services/spaceService';
import { getAttendanceSettings, updateCourseAttendanceSettings } from '../../services/attendanceService';
import { CourseAttendanceSettings } from '../../types/attendance';
import Card from '../../components/ui/Card';
import Tag from '../../components/ui/Tag';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
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
            Alert.alert('Success', 'Space settings updated successfully.');
        } catch {
            Alert.alert('Error', 'Failed to update space settings.');
        }
    };

    const handleShareCode = async () => {
        if (!space) return;
        await Share.share({ 
            message: `Join our Class Community on ClassSync!\n\nSpace Name: ${space.name}\nCode: ${space.spaceCode}\n\nDownload ClassSync to get started.` 
        });
    };

    const handleCopyCode = () => {
        if (!space) return;
        Clipboard.setString(space.spaceCode);
        Alert.alert('Copied', 'Space code copied to clipboard.');
    };

    const handleDeleteSpace = () => {
        Alert.alert(
            'Delete Community Space', 
            'This action is permanent. All posts, attendance records, and member associations will be deleted forever.', 
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything',
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
            ]
        );
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <SafeAreaView style={styles.container}>
            {/* Nav Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Space Settings</Text>
                <TouchableOpacity onPress={handleSaveDetails} style={styles.saveBtn} activeOpacity={0.7}>
                    <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* General Settings */}
                <Text style={styles.sectionLabel}>GENERAL</Text>
                <Card style={styles.formCard}>
                    <Input 
                        label="Community Name" 
                        value={spaceName} 
                        onChangeText={setSpaceName}
                        placeholder="e.g. Computer Science 2024"
                    />
                    <View style={styles.readonlyInfo}>
                        <Text style={styles.readonlyLabel}>University</Text>
                        <Text style={styles.readonlyValue}>{space?.university}</Text>
                    </View>
                    <View style={styles.readonlyInfo}>
                        <Text style={styles.readonlyLabel}>Department</Text>
                        <Text style={styles.readonlyValue}>{space?.department}</Text>
                    </View>
                </Card>

                {/* Join Code Section */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>INVITATION</Text>
                <Card style={styles.codeCard}>
                    <View style={styles.codeHeader}>
                        <Ionicons name="people-circle-outline" size={24} color={Colors.primaryBlue} />
                        <Text style={styles.codeTitle}>Invite Members</Text>
                    </View>
                    <View style={styles.codeBox}>
                        <Text style={styles.codeValue}>{space?.spaceCode}</Text>
                    </View>
                    <View style={styles.codeActions}>
                        <TouchableOpacity style={styles.codeActionBtn} onPress={handleCopyCode} activeOpacity={0.7}>
                            <Ionicons name="copy-outline" size={20} color={Colors.primaryBlue} />
                            <Text style={styles.codeActionText}>Copy</Text>
                        </TouchableOpacity>
                        <View style={styles.verticalDivider} />
                        <TouchableOpacity style={styles.codeActionBtn} onPress={handleShareCode} activeOpacity={0.7}>
                            <Ionicons name="share-outline" size={20} color={Colors.primaryBlue} />
                            <Text style={styles.codeActionText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Courses & Attendance */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>COURSES & ATTENDANCE</Text>
                {courses.map((course) => (
                    <CourseCardWithAttendance
                        key={course.id}
                        course={course}
                        spaceId={spaceId!}
                    />
                ))}

                {/* Members List */}
                <View style={styles.membersHeader}>
                    <Text style={styles.sectionLabel}>MEMBERS ({members.length})</Text>
                    <TouchableOpacity onPress={loadData} activeOpacity={0.7}>
                        <Ionicons name="refresh" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
                </View>
                <Card style={styles.membersCard}>
                    {members.map((member, index) => (
                        <View key={member.uid}>
                            <View style={styles.memberRow}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberInitials}>{member.role.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName} numberOfLines={1}>
                                        {member.fullName || member.uid}
                                    </Text>
                                    <Text style={styles.memberRole}>
                                        {member.role.replace('_', ' ')}
                                    </Text>
                                </View>
                                {member.uid !== user?.uid && (
                                    <TouchableOpacity 
                                        style={styles.moreBtn}
                                        onPress={() => {
                                            Alert.alert('Manage Member', member.fullName || member.uid, [
                                                { text: 'Make Assistant Monitor', onPress: () => promoteToAssistantMonitor(spaceId!, member.uid).then(loadData) },
                                                { text: 'Remove from Space', style: 'destructive', onPress: () => removeSpaceMember(spaceId!, member.uid).then(loadData) },
                                                { text: 'Cancel', style: 'cancel' },
                                            ]);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textTertiary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {index < members.length - 1 && <View style={styles.rowDivider} />}
                        </View>
                    ))}
                </Card>

                {/* Danger Zone */}
                <Text style={[styles.sectionLabel, { marginTop: 32, color: Colors.error }]}>DANGER ZONE</Text>
                <Card style={[styles.formCard, { borderColor: Colors.error + '40', borderWidth: 1 }]}>
                    <TouchableOpacity 
                        style={styles.dangerAction}
                        onPress={() => Alert.alert('Coming Soon', 'Transfer ownership will be available in the next update.')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.dangerIconBox}>
                            <Ionicons name="swap-horizontal" size={20} color={Colors.error} />
                        </View>
                        <Text style={styles.dangerText}>Transfer Ownership</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
                    <View style={styles.rowDivider} />
                    <TouchableOpacity style={styles.dangerAction} onPress={handleDeleteSpace} activeOpacity={0.7}>
                        <View style={styles.dangerIconBox}>
                            <Ionicons name="trash" size={20} color={Colors.error} />
                        </View>
                        <Text style={styles.dangerText}>Delete Community Space</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
                </Card>

                <View style={{ height: 60 }} />
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
            <View style={styles.courseMain}>
                <View style={styles.courseInfo}>
                    <Text style={styles.courseNameText}>{course.courseName}</Text>
                    <Text style={styles.courseCodeText}>{course.fullCode}</Text>
                </View>
                <View style={styles.switchContainer}>
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.primaryBlue} />
                    ) : (
                        <Switch
                            value={enabled}
                            onValueChange={toggleAttendance}
                            trackColor={{ false: Colors.border + '40', true: Colors.primaryBlue }}
                            thumbColor={Platform.OS === 'ios' ? undefined : (enabled ? Colors.primaryBlue : '#f4f3f4')}
                        />
                    )}
                </View>
            </View>
            <View style={styles.courseFooter}>
                <Ionicons name="person-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.lecturerText}>
                    {course.lecturerName || 'No Lecturer assigned'}
                </Text>
            </View>
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
        paddingHorizontal: 8,
        height: 56,
    },
    headerIconButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    saveBtn: {
        paddingHorizontal: 16,
        height: 44,
        justifyContent: 'center',
    },
    saveBtnText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: Colors.primaryBlue,
    },
    scrollContent: {
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: 12,
    },
    sectionLabel: {
        fontSize: 11,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textTertiary,
        letterSpacing: 1.2,
        marginBottom: 10,
        marginLeft: 4,
    },
    formCard: {
        padding: 16,
        marginBottom: 8,
    },
    readonlyInfo: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border + '15',
    },
    readonlyLabel: {
        fontSize: 11,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textTertiary,
        marginBottom: 4,
    },
    readonlyValue: {
        fontSize: 15,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textSecondary,
    },
    codeCard: {
        padding: 20,
        alignItems: 'center',
    },
    codeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    codeTitle: {
        fontSize: 15,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    codeBox: {
        backgroundColor: Colors.primaryBlue + '08',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primaryBlue + '20',
        marginBottom: 20,
    },
    codeValue: {
        fontSize: 28,
        fontFamily: 'DMSans_700Bold',
        color: Colors.primaryBlue,
        letterSpacing: 2,
    },
    codeActions: {
        flexDirection: 'row',
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: Colors.border + '15',
        paddingTop: 16,
    },
    codeActionBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    codeActionText: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: Colors.primaryBlue,
    },
    verticalDivider: {
        width: 1,
        backgroundColor: Colors.border + '15',
    },
    courseCard: {
        padding: 16,
        marginBottom: 12,
    },
    courseMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    courseInfo: {
        flex: 1,
        marginRight: 16,
    },
    courseNameText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    courseCodeText: {
        fontSize: 13,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.primaryBlue,
    },
    switchContainer: {
        height: 32,
        justifyContent: 'center',
    },
    courseFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border + '15',
    },
    lecturerText: {
        fontSize: 13,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textTertiary,
    },
    membersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 12,
        paddingRight: 4,
    },
    membersCard: {
        padding: 0,
        overflow: 'hidden',
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.subtleFill,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    memberInitials: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textSecondary,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
    },
    memberRole: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textTertiary,
        textTransform: 'capitalize',
    },
    moreBtn: {
        padding: 8,
    },
    rowDivider: {
        height: 1,
        backgroundColor: Colors.border + '15',
        marginLeft: 64,
    },
    dangerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    dangerIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.error + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dangerText: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.error,
    },
});
