import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { useCourses } from '../../hooks/useCourses';
import { useRecentPosts } from '../../hooks/usePosts';
import * as attendanceService from '../../services/attendanceService';
import { Button } from '../../components/ui/Button';
import { getSpaceMembers } from '../../services/spaceService';
import { FeatureGate } from '../../utils/platform';
import WebFeaturePrompt from '../../components/web/WebFeaturePrompt';
import { Spacing } from '../../constants/spacing';

export default function NewAttendanceSessionScreen() {
    const { colors: Colors, typography: Typography, isDark } = useTheme();
    
    // Platform gate: show web fallback if native attendance features are unavailable
    if (!FeatureGate.bleAttendance && !FeatureGate.qrScan) {
        return (
            <WebFeaturePrompt
                feature="Proximity & QR attendance"
                appStoreUrl="https://classsync.app/download"
            />
        );
    }

    const { spaceId, courseId: initialCourseId } = useLocalSearchParams<{
        spaceId: string;
        courseId: string;
    }>();
    const router = useRouter();
    const { user } = useAuthStore();
    const { courses } = useCourses(spaceId || null);
    const { posts } = useRecentPosts(20);

    const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || '');
    const [selectedLectureId, setSelectedLectureId] = useState('');
    const [loading, setLoading] = useState(false);
    const [memberCount, setMemberCount] = useState(0);

    const themedStyles = styles(Colors, Typography, isDark);

    // Filter lectures for the selected course
    const availableLectures = posts.filter(
        (p) => p.spaceId === spaceId && p.courseId === selectedCourseId && p.type === 'lecture'
    );

    useEffect(() => {
        if (selectedCourseId) {
            loadMemberCount();
        }
    }, [selectedCourseId]);

    const loadMemberCount = async () => {
        try {
            const members = await getSpaceMembers(spaceId!);
            setMemberCount(members.length);
        } catch (error) {
            console.error('Error loading members:', error);
        }
    };

    const handleStart = async () => {
        if (!selectedCourseId) {
            Alert.alert('Error', 'Please select a course');
            return;
        }

        const course = courses.find(c => c.id === selectedCourseId);
        const lecture = availableLectures.find(l => l.id === selectedLectureId);
        const lectureName = lecture ? lecture.title : 'General Lecture';

        setLoading(true);
        try {
            const sessionId = await attendanceService.startSession(
                spaceId!,
                selectedCourseId,
                course?.courseCode || 'Unknown',
                lectureName,
                user!.uid,
                memberCount || 50 // Fallback
            );

            router.replace({
                pathname: `/attendance/session/[sessionId]`,
                params: { sessionId, spaceId: spaceId!, courseId: selectedCourseId }
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to start session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={themedStyles.container}>
            <View style={themedStyles.header}>
                <TouchableOpacity onPress={() => router.back()} style={themedStyles.headerButton}>
                    <Ionicons name="close" size={24} color={Colors.onSurface} />
                </TouchableOpacity>
                <Text style={themedStyles.headerTitle}>Start Attendance</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={themedStyles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={themedStyles.section}>
                    <Text style={themedStyles.sectionTitle}>Select Course</Text>
                    <View style={themedStyles.courseList}>
                        {courses.map((course) => (
                            <TouchableOpacity
                                key={course.id}
                                style={[
                                    themedStyles.courseItem,
                                    selectedCourseId === course.id && themedStyles.courseItemActive,
                                ]}
                                onPress={() => setSelectedCourseId(course.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[themedStyles.iconBox, { backgroundColor: selectedCourseId === course.id ? 'rgba(255,255,255,0.2)' : Colors.primaryContainer }]}>
                                    <Ionicons 
                                        name="book" 
                                        size={20} 
                                        color={selectedCourseId === course.id ? '#FFFFFF' : Colors.primary} 
                                    />
                                </View>
                                <View style={themedStyles.courseInfo}>
                                    <Text style={[themedStyles.courseCode, selectedCourseId === course.id && themedStyles.textWhite]}>
                                        {course.courseCode}
                                    </Text>
                                    <Text style={[themedStyles.courseName, selectedCourseId === course.id && themedStyles.textWhiteOpacity]} numberOfLines={1}>
                                        {course.courseName}
                                    </Text>
                                </View>
                                {selectedCourseId === course.id && (
                                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {selectedCourseId ? (
                    <View style={themedStyles.section}>
                        <Text style={themedStyles.sectionTitle}>Link to Lecture (Optional)</Text>
                        {availableLectures.length > 0 ? (
                            availableLectures.map((lecture) => (
                                <TouchableOpacity
                                    key={lecture.id}
                                    style={[
                                        themedStyles.lectureItem,
                                        selectedLectureId === lecture.id && themedStyles.lectureItemActive,
                                    ]}
                                    onPress={() => setSelectedLectureId(lecture.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={themedStyles.lectureInfo}>
                                        <Text style={themedStyles.lectureTitle}>{lecture.title}</Text>
                                        <Text style={themedStyles.lectureDate}>
                                            {lecture.startTime} · {lecture.venue}
                                        </Text>
                                    </View>
                                    <View style={[themedStyles.radio, selectedLectureId === lecture.id && themedStyles.radioActive]}>
                                        {selectedLectureId === lecture.id && <View style={themedStyles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={themedStyles.emptyText}>No lectures found for this course today.</Text>
                        )}
                    </View>
                ) : null}

                <View style={themedStyles.infoBoxWrapper}>
                    <Ionicons name="information-circle" size={20} color={Colors.onSurfaceVariant} />
                    <Text style={themedStyles.infoText}>
                        Starting a session generates a dynamic code or QR for proximity verification. Students must be nearby to join.
                    </Text>
                </View>
            </ScrollView>

            <View style={themedStyles.footer}>
                <Button
                    label="Start Live Session"
                    onPress={handleStart}
                    loading={loading}
                    disabled={!selectedCourseId}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = (Colors: any, Typography: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        height: 56,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.outlineVariant,
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontFamily: Typography.family.bold,
        color: Colors.onSurface,
    },
    scrollContent: {
        padding: Spacing.screenPadding,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: Typography.family.bold,
        color: Colors.onSurfaceVariant,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 16,
    },
    courseList: {
        gap: 12,
    },
    courseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.outlineVariant,
    },
    courseItemActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    courseInfo: {
        flex: 1,
    },
    courseCode: {
        fontSize: 16,
        fontFamily: Typography.family.bold,
        color: Colors.onSurface,
    },
    courseName: {
        fontSize: 13,
        fontFamily: Typography.family.regular,
        color: Colors.onSurfaceVariant,
    },
    textWhite: {
        color: '#FFFFFF',
    },
    textWhiteOpacity: {
        color: 'rgba(255,255,255,0.7)',
    },
    lectureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.outlineVariant,
    },
    lectureItemActive: {
        borderColor: Colors.primary,
        backgroundColor: isDark ? 'rgba(0,122,255,0.05)' : 'rgba(0,122,255,0.02)',
    },
    lectureInfo: {
        flex: 1,
    },
    lectureTitle: {
        fontSize: 15,
        fontFamily: Typography.family.semiBold,
        color: Colors.onSurface,
    },
    lectureDate: {
        fontSize: 12,
        fontFamily: Typography.family.regular,
        color: Colors.onSurfaceVariant,
        marginTop: 2,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.outlineVariant,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActive: {
        borderColor: Colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: Typography.family.regular,
        color: Colors.onSurfaceVariant,
        fontStyle: 'italic',
    },
    infoBoxWrapper: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: Colors.outlineVariant,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        fontFamily: Typography.family.regular,
        color: Colors.onSurfaceVariant,
        lineHeight: 18,
    },
    footer: {
        padding: Spacing.screenPadding,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.outlineVariant,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
});
