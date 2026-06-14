import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import AttendanceRateCard from '../../components/attendance/AttendanceRateCard';
import { getStudentAttendanceSummary } from '../../services/attendanceService';
import { StudentAttendanceSummary } from '../../types';
import { useAuthStore } from '../../store/authStore';

export default function AttendanceHistoryScreen() {
    const { courseId, spaceId } = useLocalSearchParams<{ courseId: string; spaceId: string }>();
    const { colors: Colors, typography: Typography, isDark } = useTheme();
    const router = useRouter();
    const { user } = useAuthStore();

    const themedStyles = styles(Colors, Typography);

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
            <View style={[themedStyles.container, themedStyles.centered]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={themedStyles.container}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            {/* Header */}
            <View style={themedStyles.header}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={themedStyles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={Colors.onSurface} />
                </TouchableOpacity>
                <Text style={themedStyles.headerTitle}>Attendance History</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={themedStyles.scrollContent}>
                {summary ? (
                    <>
                        <View style={themedStyles.courseInfo}>
                            <Text style={themedStyles.courseCode}>{summary.courseCode}</Text>
                            <Text style={themedStyles.courseName}>{summary.courseName}</Text>
                        </View>

                        <AttendanceRateCard
                            rate={summary.attendanceRate}
                            attended={summary.attendedSessions}
                            total={summary.totalSessions}
                        />

                        <Text style={themedStyles.sectionTitle}>Attendance Calendar</Text>
                        <AttendanceCalendar sessionDates={summary.sessionDates} />

                        <View style={themedStyles.legend}>
                            <View style={themedStyles.legendItem}>
                                <View style={[themedStyles.dot, { backgroundColor: Colors.success }]} />
                                <Text style={themedStyles.legendText}>Present</Text>
                            </View>
                            <View style={themedStyles.legendItem}>
                                <View style={[themedStyles.dot, { backgroundColor: Colors.error }]} />
                                <Text style={themedStyles.legendText}>Absent</Text>
                            </View>
                        </View>
                    </>
                ) : (
                    <View style={themedStyles.emptyView}>
                        <Ionicons name="calendar-outline" size={64} color={Colors.onSurfaceVariant} />
                        <Text style={themedStyles.emptyTitle}>No Attendance Data</Text>
                        <Text style={themedStyles.emptySub}>There are no closed attendance sessions for this course yet.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = (Colors: any, Typography: any) => StyleSheet.create({
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
        borderBottomColor: Colors.outlineVariant,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: Typography.family.bold,
        color: Colors.onSurface,
    },
    scrollContent: {
        padding: 20,
    },
    courseInfo: {
        marginBottom: 20,
    },
    courseCode: {
        fontSize: 14,
        fontFamily: Typography.family.bold,
        color: Colors.primary,
        marginBottom: 4,
    },
    courseName: {
        fontSize: 22,
        fontFamily: Typography.family.bold,
        color: Colors.onSurface,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Typography.family.bold,
        color: Colors.onSurface,
        marginTop: 24,
        marginBottom: 12,
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
        fontSize: 12,
        fontFamily: Typography.family.medium,
        color: Colors.onSurfaceVariant,
    },
    emptyView: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: Typography.family.bold,
        color: Colors.onSurface,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 15,
        fontFamily: Typography.family.regular,
        color: Colors.onSurfaceVariant,
        textAlign: 'center',
    },
});
