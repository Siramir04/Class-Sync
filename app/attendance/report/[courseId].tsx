import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import AttendanceRow from '../../../components/attendance/AttendanceRow';
import {
    getSessionsByCourse,
    exportAttendanceToExcel
} from '../../../services/attendanceService';
import { AttendanceSession, AttendanceRecord } from '../../../types';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface StudentReportItem {
    uid: string;
    fullName: string;
    username: string;
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
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.accentBlue} />
                <Text style={styles.loadingText}>Generating Report...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleCol}>
                    <Text style={styles.headerTitle}>Attendance Report</Text>
                    <Text style={styles.headerSub}>{courseDetails?.code}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleExport}
                    disabled={exporting || studentData.length === 0}
                    style={styles.headerBtn}
                    activeOpacity={0.7}
                >
                    {exporting ? (
                        <ActivityIndicator size="small" color={Colors.accentBlue} />
                    ) : (
                        <Ionicons
                            name="download-outline"
                            size={22}
                            color={studentData.length === 0 ? Colors.textTertiary : Colors.accentBlue}
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
                        username={item.username}
                        attendedCount={item.attendedCount}
                        totalSessions={sessions.length}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyView}>
                        <Ionicons name="people-outline" size={64} color={Colors.textTertiary} />
                        <Text style={styles.emptyTitle}>No Students Found</Text>
                        <Text style={styles.emptySub}>There are no students registered for this course.</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
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
        paddingHorizontal: 8,
        height: 56,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.separator,
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
        color: Colors.textPrimary,
    },
    headerSub: {
        fontSize: 11,
        fontFamily: Typography.family.medium,
        color: Colors.textSecondary,
    },
    summaryBar: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.separator,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 18,
        fontFamily: Typography.family.bold,
        color: Colors.accentBlue,
    },
    summaryLabel: {
        fontSize: 12,
        fontFamily: Typography.family.medium,
        color: Colors.textSecondary,
    },
    divider: {
        width: 1,
        backgroundColor: Colors.separator,
    },
    listContent: {
        paddingBottom: 100,
    },
    loadingText: {
        fontSize: 15,
        fontFamily: Typography.family.regular,
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
        fontSize: 17,
        fontFamily: Typography.family.bold,
        color: Colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 15,
        fontFamily: Typography.family.regular,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
