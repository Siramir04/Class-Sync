import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Share,
    Switch,
    ActivityIndicator,
    Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useCourses } from '../../hooks/useCourses';
import { useSpaceRole } from '../../hooks/useSpaceRole';
import { 
    getSpaceById, 
    updateSpace, 
    deleteSpace, 
    getSpaceMembers, 
    removeSpaceMember, 
    promoteToAssistantMonitor 
} from '../../services/spaceService';
import { getAttendanceSettings, updateCourseAttendanceSettings } from '../../services/attendanceService';
import { CourseAttendanceSettings } from '../../types';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ErrorState } from '../../components/feedback/ErrorState';
import { logger } from '../../utils/logger';
import { Space, CourseMember, Course } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SpaceManageScreen() {
    const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors: Colors, typography: Typography } = useTheme();
    const { user } = useAuthStore();

    const [space, setSpace] = useState<Space | null>(null);
    const [members, setMembers] = useState<CourseMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [spaceName, setSpaceName] = useState('');
    const { courses } = useCourses(spaceId || null);

    const { 
        isMonitor, 
        canManageSpace,
        canDeleteSpace 
    } = useSpaceRole(spaceId!);

    useEffect(() => {
        if (!spaceId) return;
        loadData();
    }, [spaceId]);

    // Unauthorized Access Redirect
    useEffect(() => {
        if (!loading && !canManageSpace) {
            Alert.alert('Unauthorized', 'You do not have permission to manage this space.');
            router.back();
        }
    }, [loading, canManageSpace]);

    const loadData = async () => {
        if (!spaceId) return;
        setLoading(true);
        setError(null);
        try {
            const [spaceData, membersData] = await Promise.all([
                getSpaceById(spaceId),
                getSpaceMembers(spaceId),
            ]);
            setSpace(spaceData);
            setSpaceName(spaceData?.name || '');
            setMembers(membersData);
        } catch (err) {
            logger.error('Error loading space management data:', err);
            setError('Failed to load space data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDetails = async () => {
        if (!spaceId || !spaceName.trim()) return;
        try {
            await updateSpace(spaceId, { name: spaceName.trim() });
            Alert.alert('Success', 'Space settings updated successfully.');
        } catch (err) {
            logger.error('Failed to update space:', err);
            Alert.alert('Error', 'Failed to update space settings.');
        }
    };

    const handleShareCode = async () => {
        if (!space) return;
        await Share.share({ 
            message: `Join our Class Community on ClassSync!\n\nSpace Name: ${space.name}\nCode: ${space.spaceCode}\n\nDownload ClassSync to get started.` 
        });
    };

    const handleCopyCode = async () => {
        if (!space) return;
        await Clipboard.setStringAsync(space.spaceCode);
        Alert.alert('Copied', 'Space code copied to clipboard.');
    };

    const handleDeleteSpace = () => {
        if (!canDeleteSpace) {
            Alert.alert('Permission Denied', 'Only the Primary Monitor can delete the space.');
            return;
        }

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
                        } catch (err) {
                            logger.error('Failed to delete space:', err);
                            Alert.alert('Error', 'Could not delete space.');
                        }
                    },
                },
            ]
        );
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'monitor': return Colors.primaryNavy;
            case 'assistant_monitor': return Colors.textSecondary;
            case 'lecturer': return Colors.success;
            default: return Colors.textSecondary;
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;
    if (!canManageSpace) return null;

    return (
        <View style={[styles.container, { backgroundColor: Colors.background, paddingTop: insets.top }]}>
            {/* Nav Header */}
            <View style={[styles.header, { backgroundColor: Colors.surface, borderBottomColor: Colors.separator }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: Colors.textPrimary, fontFamily: Typography.family.bold }]}>Space Settings</Text>
                <TouchableOpacity onPress={handleSaveDetails} style={styles.saveBtn} activeOpacity={0.7}>
                    <Text style={[styles.saveBtnText, { color: Colors.accentBlue, fontFamily: Typography.family.bold }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* General Settings */}
                <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Typography.family.bold }]}>GENERAL</Text>
                <Card style={styles.formCard}>
                    <Input 
                        label="Community Name" 
                        value={spaceName} 
                        onChangeText={setSpaceName}
                        placeholder="e.g. Computer Science 2024"
                    />
                    <View style={[styles.readonlyInfo, { borderTopColor: Colors.separator }]}>
                        <Text style={[styles.readonlyLabel, { color: Colors.textTertiary, fontFamily: Typography.family.bold }]}>University</Text>
                        <Text style={[styles.readonlyValue, { color: Colors.textSecondary, fontFamily: Typography.family.medium }]}>{space?.university}</Text>
                    </View>
                    <View style={[styles.readonlyInfo, { borderTopColor: Colors.separator }]}>
                        <Text style={[styles.readonlyLabel, { color: Colors.textTertiary, fontFamily: Typography.family.bold }]}>Department</Text>
                        <Text style={[styles.readonlyValue, { color: Colors.textSecondary, fontFamily: Typography.family.medium }]}>{space?.department}</Text>
                    </View>
                </Card>

                {/* Join Code Section */}
                <Text style={[styles.sectionLabel, { marginTop: 24, color: Colors.textTertiary, fontFamily: Typography.family.bold }]}>INVITATION</Text>
                <Card style={styles.codeCard}>
                    <View style={styles.codeHeader}>
                        <Ionicons name="people-circle-outline" size={24} color={Colors.accentBlue} />
                        <Text style={[styles.codeTitle, { color: Colors.textPrimary, fontFamily: Typography.family.bold }]}>Invite Members</Text>
                    </View>
                    <View style={[styles.codeBox, { backgroundColor: Colors.accentBlue + '08', borderColor: Colors.accentBlue + '20' }]}>
                        <Text style={[styles.codeValue, { color: Colors.accentBlue, fontFamily: Typography.family.bold }]}>{space?.spaceCode}</Text>
                    </View>
                    <View style={[styles.codeActions, { borderTopColor: Colors.separator }]}>
                        <TouchableOpacity style={styles.codeActionBtn} onPress={handleCopyCode} activeOpacity={0.7}>
                            <Ionicons name="copy-outline" size={20} color={Colors.accentBlue} />
                            <Text style={[styles.codeActionText, { color: Colors.accentBlue, fontFamily: Typography.family.bold }]}>Copy</Text>
                        </TouchableOpacity>
                        <View style={[styles.verticalDivider, { backgroundColor: Colors.separator }]} />
                        <TouchableOpacity style={styles.codeActionBtn} onPress={handleShareCode} activeOpacity={0.7}>
                            <Ionicons name="share-outline" size={20} color={Colors.accentBlue} />
                            <Text style={[styles.codeActionText, { color: Colors.accentBlue, fontFamily: Typography.family.bold }]}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Courses & Attendance */}
                <Text style={[styles.sectionLabel, { marginTop: 24, color: Colors.textTertiary, fontFamily: Typography.family.bold }]}>COURSES & ATTENDANCE</Text>
                {courses.map((course) => (
                    <CourseCardWithAttendance
                        key={course.id}
                        course={course}
                        spaceId={spaceId!}
                        Colors={Colors}
                        Typography={Typography}
                    />
                ))}

                {/* Members List */}
                <View style={styles.membersHeader}>
                    <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Typography.family.bold }]}>MEMBERS ({members.length})</Text>
                    <TouchableOpacity onPress={loadData} activeOpacity={0.7}>
                        <Ionicons name="refresh" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
                </View>
                <Card style={styles.membersCard}>
                    {members.map((member, index) => (
                        <View key={member.uid}>
                            <View style={styles.memberRow}>
                                <View style={[styles.memberAvatar, { backgroundColor: getRoleColor(member.role) + '20' }]}>
                                    <Ionicons 
                                        name={member.role === 'student' ? 'person' : 'shield-checkmark'} 
                                        size={18} 
                                        color={getRoleColor(member.role)} 
                                    />
                                </View>
                                <View style={styles.memberInfo}>
                                    <Text style={[styles.memberName, { color: Colors.textPrimary, fontFamily: Typography.family.semiBold }]} numberOfLines={1}>
                                        {member.fullName || member.uid}
                                    </Text>
                                    <Text style={[styles.memberRole, { color: getRoleColor(member.role), fontFamily: Typography.family.medium }]}>
                                        {member.role.replace('_', ' ')}
                                    </Text>
                                </View>
                                {member.uid !== user?.uid && member.role !== 'monitor' && (
                                    <TouchableOpacity 
                                        style={styles.moreBtn}
                                        onPress={() => {
                                            const options = [];
                                            
                                            if (isMonitor && member.role !== 'assistant_monitor') {
                                                options.push({ text: 'Make Assistant Monitor', onPress: () => promoteToAssistantMonitor(spaceId!, member.uid).then(loadData) });
                                            }
                                            
                                            // Assistant Monitor cannot remove Monitor (already handled by role !== 'monitor')
                                            options.push({ text: 'Remove from Space', style: 'destructive', onPress: () => removeSpaceMember(spaceId!, member.uid).then(loadData) });
                                            options.push({ text: 'Cancel', style: 'cancel' });

                                            Alert.alert('Manage Member', member.fullName || member.uid, options as any);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textTertiary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {index < members.length - 1 && <View style={[styles.rowDivider, { backgroundColor: Colors.separator }]} />}
                        </View>
                    ))}
                </Card>

                {/* Danger Zone */}
                {isMonitor && (
                    <>
                        <Text style={[styles.sectionLabel, { marginTop: 32, color: Colors.error, fontFamily: Typography.family.bold }]}>DANGER ZONE</Text>
                        <Card style={[styles.formCard, { borderColor: Colors.error + '40', borderWidth: 1 }]}>
                            <TouchableOpacity 
                                style={styles.dangerAction}
                                onPress={() => Alert.alert('Coming Soon', 'Transfer ownership will be available in the next update.')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.dangerIconBox, { backgroundColor: Colors.error + '10' }]}>
                                    <Ionicons name="swap-horizontal" size={20} color={Colors.error} />
                                </View>
                                <Text style={[styles.dangerText, { color: Colors.error, fontFamily: Typography.family.semiBold }]}>Transfer Ownership</Text>
                                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                            </TouchableOpacity>
                            <View style={[styles.rowDivider, { backgroundColor: Colors.separator }]} />
                            <TouchableOpacity style={styles.dangerAction} onPress={handleDeleteSpace} activeOpacity={0.7}>
                                <View style={[styles.dangerIconBox, { backgroundColor: Colors.error + '10' }]}>
                                    <Ionicons name="trash" size={20} color={Colors.error} />
                                </View>
                                <Text style={[styles.dangerText, { color: Colors.error, fontFamily: Typography.family.semiBold }]}>Delete Community Space</Text>
                                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                            </TouchableOpacity>
                        </Card>
                    </>
                )}

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

function CourseCardWithAttendance({ course, spaceId, Colors, Typography }: { course: Course, spaceId: string, Colors: any, Typography: any }) {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAttendanceSettings(course.id, spaceId)
            .then((settings: CourseAttendanceSettings) => setEnabled(settings.isEnabled))
            .catch((err) => logger.error('Attendance settings fetch error:', err))
            .finally(() => setLoading(false));
    }, [course.id, spaceId]);

    const toggleAttendance = async (value: boolean) => {
        try {
            await updateCourseAttendanceSettings(course.id, spaceId, { isEnabled: value });
            setEnabled(value);
        } catch (err) {
            logger.error('Failed to update attendance settings:', err);
            Alert.alert('Error', 'Failed to update attendance settings');
        }
    };

    return (
        <Card style={styles.courseCard}>
            <View style={styles.courseMain}>
                <View style={styles.courseInfo}>
                    <Text style={[styles.courseNameText, { color: Colors.textPrimary, fontFamily: Typography.family.bold }]}>{course.courseName}</Text>
                    <Text style={[styles.courseCodeText, { color: Colors.accentBlue, fontFamily: Typography.family.semiBold }]}>{course.fullCode}</Text>
                </View>
                <View style={styles.switchContainer}>
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.accentBlue} />
                    ) : (
                        <Switch
                            value={enabled}
                            onValueChange={toggleAttendance}
                            trackColor={{ false: Colors.separator, true: Colors.accentBlue }}
                            thumbColor={Platform.OS === 'ios' ? undefined : (enabled ? Colors.accentBlue : '#f4f3f4')}
                        />
                    )}
                </View>
            </View>
            <View style={[styles.courseFooter, { borderTopColor: Colors.separator }]}>
                <Ionicons name="person-outline" size={14} color={Colors.textTertiary} />
                <Text style={[styles.lecturerText, { color: Colors.textTertiary, fontFamily: Typography.family.medium }]}>
                    {course.lecturerName || 'No Lecturer assigned'}
                </Text>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 56,
        borderBottomWidth: 1,
    },
    headerIconButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
    },
    saveBtn: {
        paddingHorizontal: 16,
        height: 44,
        justifyContent: 'center',
    },
    saveBtnText: {
        fontSize: 16,
    },
    scrollContent: {
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: 12,
    },
    sectionLabel: {
        fontSize: 11,
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
    },
    readonlyLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    readonlyValue: {
        fontSize: 15,
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
    },
    codeBox: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
    },
    codeValue: {
        fontSize: 28,
        letterSpacing: 2,
    },
    codeActions: {
        flexDirection: 'row',
        width: '100%',
        borderTopWidth: 1,
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
    },
    verticalDivider: {
        width: 1,
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
        marginBottom: 2,
    },
    courseCodeText: {
        fontSize: 13,
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
    },
    lecturerText: {
        fontSize: 13,
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 15,
    },
    memberRole: {
        fontSize: 12,
        textTransform: 'capitalize',
    },
    moreBtn: {
        padding: 8,
    },
    rowDivider: {
        height: 1,
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dangerText: {
        flex: 1,
        fontSize: 15,
    },
});

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
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.separator,
    },
    headerIconButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: Typography.family.bold,
        color: Colors.textPrimary,
    },
    saveBtn: {
        paddingHorizontal: 16,
        height: 44,
        justifyContent: 'center',
    },
    saveBtnText: {
        fontSize: 16,
        fontFamily: Typography.family.bold,
        color: Colors.accentBlue,
    },
    scrollContent: {
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: 12,
    },
    sectionLabel: {
        fontSize: 11,
        fontFamily: Typography.family.bold,
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
        borderTopColor: Colors.separator,
    },
    readonlyLabel: {
        fontSize: 11,
        fontFamily: Typography.family.bold,
        color: Colors.textTertiary,
        marginBottom: 4,
    },
    readonlyValue: {
        fontSize: 15,
        fontFamily: Typography.family.medium,
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
        fontFamily: Typography.family.bold,
        color: Colors.textPrimary,
    },
    codeBox: {
        backgroundColor: Colors.accentBlue + '08',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.accentBlue + '20',
        marginBottom: 20,
    },
    codeValue: {
        fontSize: 28,
        fontFamily: Typography.family.bold,
        color: Colors.accentBlue,
        letterSpacing: 2,
    },
    codeActions: {
        flexDirection: 'row',
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: Colors.separator,
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
        fontFamily: Typography.family.bold,
        color: Colors.accentBlue,
    },
    verticalDivider: {
        width: 1,
        backgroundColor: Colors.separator,
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
        fontFamily: Typography.family.bold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    courseCodeText: {
        fontSize: 13,
        fontFamily: Typography.family.semiBold,
        color: Colors.accentBlue,
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
        borderTopColor: Colors.separator,
    },
    lecturerText: {
        fontSize: 13,
        fontFamily: Typography.family.medium,
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    memberInitials: {
        fontSize: 16,
        fontFamily: Typography.family.bold,
        color: Colors.textSecondary,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 15,
        fontFamily: Typography.family.semiBold,
        color: Colors.textPrimary,
    },
    memberRole: {
        fontSize: 12,
        fontFamily: Typography.family.medium,
        textTransform: 'capitalize',
    },
    moreBtn: {
        padding: 8,
    },
    rowDivider: {
        height: 1,
        backgroundColor: Colors.separator,
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
        fontFamily: Typography.family.semiBold,
        color: Colors.error,
    },
});
