import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import AttendanceRow from '../../../components/attendance/AttendanceRow';
import {
    getSessionsByCourse,
    getSessionRecords,
    exportAttendanceToExcel
} from '../../../services/attendanceService';
import { AttendanceSession, AttendanceRecord } from '../../../types/attendance';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface StudentReportItem {
    uid: string;
    fullName: string;
    regNumber: string;
    attendedCount: number;
}

export default function AttendanceReportScreen() {
    const { courseId, spaceId } = useLocalSearchParams<{ courseId: string; spaceId: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [sessions, setSessions] = useState<AttendanceSession[]>([]);
    const [studentData, setStudentData] = useState<StudentReportItem[]>([]);
    const [courseDetails, setCourseDetails] = useState<{ name: string; code: string } | null>(null);

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
                const sessionList = await getSessionsByCourse(courseId, spaceId);
                const closedSessions = sessionList.filter(s => !s.isActive);
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
                        const recordSnap = await getDoc(doc(db, 'spaces', spaceId, 'courses', courseId, 'sessions', session.id, 'records', mDoc.id));
                        if (recordSnap.exists()) attendedCount++;
                    }

                    students.push({
                        uid: mDoc.id,
                        fullName: userData.fullName,
                        regNumber: userData.regNumber || 'N/A',
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
        } catch (error) {
            Alert.alert('Export Failed', 'An error occurred while generating the Excel file.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.primaryBlue} />
                <Text style={styles.loadingText}>Generating Report...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Attendance Report</Text>
                    <Text style={styles.headerSub}>{courseDetails?.code}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleExport}
                    disabled={exporting || studentData.length === 0}
                >
                    {exporting ? (
                        <ActivityIndicator size="small" color={Colors.primaryBlue} />
                    ) : (
                        <Ionicons
                            name="download-outline"
                            size={24}
                            color={studentData.length === 0 ? Colors.textSecondary : Colors.primaryBlue}
                        />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.summaryBar}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{sessions.length}</Text>
                    <Text style={styles.summaryLabel}>Sessions</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{studentData.length}</Text>
                    <Text style={styles.summaryLabel}>Students</Text>
                </View>
            </View>

            <FlatList
                data={studentData}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                    <AttendanceRow
                        studentName={item.fullName}
                        regNumber={item.regNumber}
                        attendedCount={item.attendedCount}
                        totalSessions={sessions.length}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyView}>
                        <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
                        <Text style={styles.emptyTitle}>No Students Found</Text>
                        <Text style={styles.emptySub}>There are no students registered for this course.</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
    },
    headerSub: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
    summaryBar: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        ...Typography.sectionHeader,
        color: Colors.primaryBlue,
        fontSize: 18,
    },
    summaryLabel: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
    divider: {
        width: 1,
        backgroundColor: Colors.border,
    },
    listContent: {
        paddingBottom: 40,
    },
    loadingText: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginTop: 12,
    },
    emptyView: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
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
