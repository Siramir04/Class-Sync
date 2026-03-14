import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import AttendanceRateCard from '../../components/attendance/AttendanceRateCard';
import { getStudentAttendanceSummary } from '../../services/attendanceService';
import { StudentAttendanceSummary } from '../../types/attendance';
import { useAuthStore } from '../../store/authStore';

export default function AttendanceHistoryScreen() {
    const { courseId, spaceId } = useLocalSearchParams<{ courseId: string; spaceId: string }>();
    const router = useRouter();
    const { user } = useAuthStore();

    const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!courseId || !spaceId || !user) return;

        const fetchSummary = async () => {
            try {
                const data = await getStudentAttendanceSummary(courseId, spaceId, user.uid);
                setSummary(data);
            } catch (error) {
                console.error('Failed to fetch attendance summary:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [courseId, spaceId, user]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.primaryBlue} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Attendance History</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {summary ? (
                    <>
                        <View style={styles.courseInfo}>
                            <Text style={styles.courseCode}>{summary.courseCode}</Text>
                            <Text style={styles.courseName}>{summary.courseName}</Text>
                        </View>

                        <AttendanceRateCard
                            rate={summary.attendanceRate}
                            attended={summary.attendedSessions}
                            total={summary.totalSessions}
                        />

                        <Text style={styles.sectionTitle}>Attendance Calendar</Text>
                        <AttendanceCalendar sessionDates={summary.sessionDates} />

                        <View style={styles.legend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: Colors.success }]} />
                                <Text style={styles.legendText}>Present</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: Colors.error }]} />
                                <Text style={styles.legendText}>Absent</Text>
                            </View>
                        </View>
                    </>
                ) : (
                    <View style={styles.emptyView}>
                        <Ionicons name="calendar-outline" size={64} color={Colors.textSecondary} />
                        <Text style={styles.emptyTitle}>No Attendance Data</Text>
                        <Text style={styles.emptySub}>There are no closed attendance sessions for this course yet.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 16,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '15',
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
    },
    scrollContent: {
        padding: 20,
    },
    courseInfo: {
        marginBottom: 20,
    },
    courseCode: {
        ...Typography.sectionHeader,
        color: Colors.primaryBlue,
        marginBottom: 4,
    },
    courseName: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
    },
    sectionTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        marginTop: 24,
        marginBottom: 8,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
    emptyView: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySub: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
