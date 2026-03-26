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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useCourses } from '../../hooks/useCourses';
import { useRecentPosts } from '../../hooks/usePosts';
import * as attendanceService from '../../services/attendanceService';
import { Button } from '../../components/ui/Button';
import { getSpaceMembers } from '../../services/spaceService';

export default function NewAttendanceSessionScreen() {
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Start Attendance</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Course</Text>
                    <View style={styles.courseList}>
                        {courses.map((course) => (
                            <TouchableOpacity
                                key={course.id}
                                style={[
                                    styles.courseItem,
                                    selectedCourseId === course.id && styles.courseItemActive,
                                ]}
                                onPress={() => setSelectedCourseId(course.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: selectedCourseId === course.id ? '#FFFFFF' : Colors.accentBlue + '15' }]}>
                                    <Ionicons 
                                        name="book" 
                                        size={20} 
                                        color={selectedCourseId === course.id ? Colors.accentBlue : Colors.accentBlue} 
                                    />
                                </View>
                                <View style={styles.courseInfo}>
                                    <Text style={[styles.courseCode, selectedCourseId === course.id && styles.textWhite]}>
                                        {course.courseCode}
                                    </Text>
                                    <Text style={[styles.courseName, selectedCourseId === course.id && styles.textWhiteOpacity]} numberOfLines={1}>
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
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Link to Lecture (Optional)</Text>
                        {availableLectures.length > 0 ? (
                            availableLectures.map((lecture) => (
                                <TouchableOpacity
                                    key={lecture.id}
                                    style={[
                                        styles.lectureItem,
                                        selectedLectureId === lecture.id && styles.lectureItemActive,
                                    ]}
                                    onPress={() => setSelectedLectureId(lecture.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.lectureInfo}>
                                        <Text style={styles.lectureTitle}>{lecture.title}</Text>
                                        <Text style={styles.lectureDate}>
                                            {lecture.startTime} · {lecture.venue}
                                        </Text>
                                    </View>
                                    <View style={[styles.radio, selectedLectureId === lecture.id && styles.radioActive]}>
                                        {selectedLectureId === lecture.id && <View style={styles.radioInner} />}
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No lectures found for this course today.</Text>
                        )}
                    </View>
                ) : null}

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color={Colors.textSecondary} />
                    <Text style={styles.infoText}>
                        Starting a session generates a dynamic code or QR for proximity verification. Students must be nearby to join.
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
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

const styles = StyleSheet.create({
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
        borderBottomColor: Colors.separator,
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
        color: Colors.textPrimary,
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
        color: Colors.textSecondary,
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
        borderColor: Colors.separator,
    },
    courseItemActive: {
        backgroundColor: Colors.accentBlue,
        borderColor: Colors.accentBlue,
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
        color: Colors.textPrimary,
    },
    courseName: {
        fontSize: 13,
        fontFamily: Typography.family.regular,
        color: Colors.textSecondary,
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
        borderColor: Colors.separator,
    },
    lectureItemActive: {
        borderColor: Colors.accentBlue,
        backgroundColor: Colors.accentBlue + '05',
    },
    lectureInfo: {
        flex: 1,
    },
    lectureTitle: {
        fontSize: 15,
        fontFamily: Typography.family.semiBold,
        color: Colors.textPrimary,
    },
    lectureDate: {
        fontSize: 12,
        fontFamily: Typography.family.regular,
        color: Colors.textTertiary,
        marginTop: 2,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.separator,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActive: {
        borderColor: Colors.accentBlue,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.accentBlue,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: Typography.family.regular,
        color: Colors.textTertiary,
        fontStyle: 'italic',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: Colors.separator,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        fontFamily: Typography.family.regular,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    footer: {
        padding: Spacing.screenPadding,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.separator,
    },
});
