import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import AttendanceRow from '../../../components/attendance/AttendanceRow';
import {
    getSessionsByCourse,
    exportAttendanceToExcel
} from '../../../services/attendanceService';
import { AttendanceSession, AttendanceRecord } from '../../../types';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Spacing } from '../../../constants/spacing';

interface StudentReportItem {
    uid: string;
    fullName: string;
    username: string;
    attendedCount: number;
}

export default function AttendanceReportScreen() {
    const { courseId, spaceId } = useLocalSearchParams<{ courseId: string; spaceId: string }>();
    const router = useRouter();
    const { colors: Colors, typography: Typography, isDark } = useTheme();

    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [sessions, setSessions] = useState<AttendanceSession[]>([]);
    const [studentData, setStudentData] = useState<StudentReportItem[]>([]);
    const [courseDetails, setCourseDetails] = useState<{ name: string; code: string } | null>(null);

    const themedStyles = styles(Colors, Typography);

    useEffect(() => {
        if (!courseId || !spaceId) return;

        const fetchData = async () => {
            try {
                // 1. Fetch Course Details
                const courseSnap = await getDoc(doc(db, 'spaces', spaceId, 'courses', courseId));
                if (courseSnap.exists()) {
                    setCourseDetails({
                        name: courseSnap.data().courseName,
                        code: courseSnap.data().fullCode
                    });
                }

                // 2. Fetch all closed sessions
                const sessionList = await getSessionsByCourse(spaceId, courseId);
                const closedSessions = sessionList.filter(s => !s.isOpen);
                setSessions(closedSessions);

                // 3. Fetch all course members
                const membersSnap = await getDocs(collection(db, 'spaces', spaceId, 'courses', courseId, 'members'));

                // 4. For each member, calculate attended sessions
                const students: StudentReportItem[] = [];
                for (const mDoc of membersSnap.docs) {
                    const userSnap = await getDoc(doc(db, 'users', mDoc.id));
                    const userData = userSnap.data();

                    if (!userData || userData.role !== 'student') continue;

                    let attendedCount = 0;
                    for (const session of closedSessions) {
                        const recordSnap = await getDoc(doc(db, 'spaces', spaceId, 'courses', courseId, 'attendance', session.id, 'records', mDoc.id));
                        if (recordSnap.exists() && recordSnap.data().isPresent) {
                            attendedCount++;
                        }
                    }

                    students.push({
                        uid: mDoc.id,
                        fullName: userData.fullName,
                        username: userData.username || 'N/A',
                        attendedCount
                    });
                }

                // Sort by name
                students.sort((a, b) => a.fullName.localeCompare(b.fullName));
                setStudentData(students);

            } catch (error) {
                console.error('Failed to fetch report data:', error);
                Alert.alert('Error', 'Failed to load attendance report');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, spaceId]);

    const handleExport = async () => {
        if (!courseDetails) return;
        setExporting(true);
        try {
            await exportAttendanceToExcel(courseId, spaceId, courseDetails.name, courseDetails.code);
            Alert.alert('Success', 'Attendance report exported successfully.');
        } catch (error) {
            Alert.alert('Export Failed', 'An error occurred while generating the report.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <View style={[themedStyles.container, themedStyles.centered]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={themedStyles.loadingText}>Generating Report...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={themedStyles.container}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            {/* Header */}
            <View style={themedStyles.header}>
                <TouchableOpacity onPress={() => router.back()} style={themedStyles.headerBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.onSurface} />
                </TouchableOpacity>
                <View style={themedStyles.headerTitleCol}>
                    <Text style={themedStyles.headerTitle}>Attendance Report</Text>
                    <Text style={themedStyles.headerSub}>{courseDetails?.code}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleExport}
                    disabled={exporting || studentData.length === 0}
                    style={themedStyles.headerBtn}
                    activeOpacity={0.7}
                >
                    {exporting ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                        <Ionicons
                            name="download-outline"
                            size={22}
                            color={studentData.length === 0 ? Colors.onSurfaceVariant : Colors.primary}
                        />
                    )}
                </TouchableOpacity>
            </View>

            <View style={themedStyles.summaryBar}>
                <View style={themedStyles.summaryItem}>
                    <Text style={themedStyles.summaryValue}>{sessions.length}</Text>
                    <Text style={themedStyles.summaryLabel}>Sessions</Text>
                </View>
                <View style={themedStyles.divider} />
                <View style={themedStyles.summaryItem}>
                    <Text style={themedStyles.summaryValue}>{studentData.length}</Text>
                    <Text style={themedStyles.summaryLabel}>Students</Text>
                </View>
            </View>

            <FlatList
                data={studentData}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                    <AttendanceRow
                        studentName={item.fullName}
                        username={item.username}
                        attendedCount={item.attendedCount}
                        totalSessions={sessions.length}
                    />
                )}
                ListEmptyComponent={
                    <View style={themedStyles.emptyView}>
                        <Ionicons name="people-outline" size={64} color={Colors.onSurfaceVariant} />
                        <Text style={themedStyles.emptyTitle}>No Students Found</Text>
                        <Text style={themedStyles.emptySub}>There are no students registered for this course.</Text>
                    </View>
                }
                contentContainerStyle={themedStyles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = (Colors: any, Typography: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 56,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.outlineVariant,
    },
    headerBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleCol: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: Typography.family.bold,
        color: Colors.onSurface,
    },
    headerSub: {
        fontSize: 11,
        fontFamily: Typography.family.medium,
        color: Colors.onSurfaceVariant,
    },
    summaryBar: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.outlineVariant,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 18,
        fontFamily: Typography.family.bold,
        color: Colors.primary,
    },
    summaryLabel: {
        fontSize: 12,
        fontFamily: Typography.family.medium,
        color: Colors.onSurfaceVariant,
    },
    divider: {
        width: 1,
        backgroundColor: Colors.outlineVariant,
    },
    listContent: {
        paddingBottom: 100,
    },
    loadingText: {
        fontSize: 15,
        fontFamily: Typography.family.regular,
        color: Colors.onSurfaceVariant,
        marginTop: 12,
    },
    emptyView: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 17,
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
