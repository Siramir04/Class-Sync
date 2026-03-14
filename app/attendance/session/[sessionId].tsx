import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, FlatList, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import QRDisplay from '../../../components/attendance/QRDisplay';
import QRScanner from '../../../components/attendance/QRScanner';
import {
    refreshQRToken,
    closeSession,
    getSessionRecords,
    markPresent,
    validateQRToken,
    hasStudentScanned
} from '../../../services/attendanceService';
import { AttendanceSession, AttendanceRecord } from '../../../types/attendance';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuthStore } from '../../../store/authStore';

export default function SessionScreen() {
    const { sessionId, courseId, spaceId } = useLocalSearchParams<{
        sessionId: string;
        courseId: string;
        spaceId: string
    }>();
    const router = useRouter();
    const { user } = useAuthStore();

    const [session, setSession] = useState<AttendanceSession | null>(null);
    const [countdown, setCountdown] = useState(60);
    const [showLiveList, setShowLiveList] = useState(false);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isMarking, setIsMarking] = useState(false);
    const [hasAlreadyScanned, setHasAlreadyScanned] = useState(false);

    const isLecturerOrMonitor = user?.role === 'lecturer' || user?.role === 'monitor';

    // Subscribe to session changes
    useEffect(() => {
        if (!sessionId || !courseId || !spaceId) return;

        const unsubscribe = onSnapshot(
            doc(db, 'spaces', spaceId, 'courses', courseId, 'sessions', sessionId),
            (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSession({
                        ...data,
                        id: docSnap.id,
                        date: data.date?.toDate() ?? new Date(),
                        qrExpiresAt: data.qrExpiresAt?.toDate() ?? new Date(),
                    } as AttendanceSession);
                } else {
                    Alert.alert('Error', 'Session not found');
                    router.back();
                }
            }
        );

        return () => unsubscribe();
    }, [sessionId, courseId, spaceId]);

    // Check if student already scanned
    useEffect(() => {
        if (!isLecturerOrMonitor && user && sessionId && courseId && spaceId) {
            hasStudentScanned(sessionId, courseId, spaceId, user.uid)
                .then(setHasAlreadyScanned)
                .catch(console.error);
        }
    }, [user, sessionId, courseId, spaceId, isLecturerOrMonitor]);

    // Timer for QR refresh (Lecturer only)
    useEffect(() => {
        if (!isLecturerOrMonitor || !session?.isActive) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    handleRefresh();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [session?.isActive, isLecturerOrMonitor, sessionId, courseId, spaceId]);

    const handleRefresh = async () => {
        try {
            await refreshQRToken(sessionId, courseId, spaceId);
            setCountdown(60);
        } catch (error) {
            console.error('Failed to refresh token:', error);
        }
    };

    const handleEndSession = () => {
        Alert.alert(
            'End Session',
            'Are you sure you want to end this attendance session?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Session',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await closeSession(sessionId, courseId, spaceId);
                            Alert.alert('Success', 'Session ended successfully', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to end session');
                        }
                    }
                }
            ]
        );
    };

    const fetchRecords = async () => {
        try {
            const data = await getSessionRecords(sessionId, courseId, spaceId);
            setRecords(data);
            setShowLiveList(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch live list');
        }
    };

    const handleScan = async (scannedToken: string) => {
        if (!user || isMarking || hasAlreadyScanned || !session) return;

        // 1. Validate Reg Number
        if (!user.regNumber) {
            Alert.alert(
                'Profile Incomplete',
                'Please update your Profile with your Registration Number before marking attendance.',
                [{ text: 'OK', onPress: () => router.push('/(tabs)/profile') }]
            );
            return;
        }

        // 2. Validate Token
        const isValid = validateQRToken(scannedToken, sessionId, session.qrExpiresAt);
        if (!isValid) {
            Alert.alert('Invalid QR', 'This QR code has expired or is invalid. Please scan the current one.');
            return;
        }

        setIsMarking(true);
        try {
            await markPresent(
                sessionId,
                courseId,
                spaceId,
                user.uid,
                user.fullName,
                user.regNumber
            );
            setHasAlreadyScanned(true);
            Alert.alert('Success', 'Attendance marked successfully!');
        } catch (error: any) {
            Alert.alert('Failed', error.message || 'Failed to mark attendance');
        } finally {
            setIsMarking(false);
        }
    };

    if (!session) return (
        <View style={[styles.container, styles.centered]}>
            <ActivityIndicator size="large" color={Colors.primaryBlue} />
        </View>
    );

    if (!isLecturerOrMonitor) {
        // STUDENT VIEW
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Scan Attendance</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {hasAlreadyScanned ? (
                    <View style={styles.successView}>
                        <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
                        <Text style={styles.successTitle}>Attendance Recorded</Text>
                        <Text style={styles.successSub}>You have been marked present for this session.</Text>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.backButtonText}>Back to Course</Text>
                        </TouchableOpacity>
                    </View>
                ) : !session.isActive ? (
                    <View style={styles.successView}>
                        <Ionicons name="alert-circle" size={80} color={Colors.error} />
                        <Text style={styles.successTitle}>Session Closed</Text>
                        <Text style={styles.successSub}>This attendance session has already been closed by the lecturer.</Text>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.backButtonText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <QRScanner onScan={handleScan} isActive={!isMarking} />
                )}

                {isMarking && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="white" />
                        <Text style={styles.loadingText}>Recording attendance...</Text>
                    </View>
                )}
            </View>
        );
    }

    // LECTURER / MONITOR VIEW
    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Attendance — {session.courseCode}</Text>
                <TouchableOpacity onPress={handleEndSession} activeOpacity={0.7} style={styles.endBtn}>
                    <Text style={styles.endText}>End</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.qrCard}>
                    <Text style={styles.scanLabel}>Scan to mark attendance</Text>

                    <View style={styles.qrWrapper}>
                        <QRDisplay value={session.qrToken} />
                    </View>

                    <Text style={styles.timerText}>
                        Refreshes in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                    </Text>

                    <Text style={styles.securityHint}>
                        QR code refreshes every 60 seconds for security
                    </Text>
                </View>

                <View style={styles.statsSection}>
                    <View style={styles.counterRow}>
                        <Text style={styles.counterLabel}>Students present</Text>
                        <Text style={styles.counterValue}>{session.presentCount || 0}</Text>
                    </View>

                    <TouchableOpacity style={styles.listLink} onPress={fetchRecords} activeOpacity={0.7}>
                        <Text style={styles.listLinkText}>View live list</Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.primaryBlue} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handleEndSession}
                    disabled={!session.isActive}
                    style={[styles.endButton, !session.isActive && { opacity: 0.5 }]}
                    activeOpacity={0.7}
                >
                    <Text style={styles.endButtonText}>
                        {session.isActive ? 'End Session' : 'Session Ended'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Live List Modal */}
            <Modal
                visible={showLiveList}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowLiveList(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Present Students ({records.length})</Text>
                            <TouchableOpacity onPress={() => setShowLiveList(false)} activeOpacity={0.7} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={records}
                            keyExtractor={(item) => item.studentUid}
                            renderItem={({ item }) => (
                                <View style={styles.recordRow}>
                                    <View>
                                        <Text style={styles.studentName}>{item.studentName}</Text>
                                        <Text style={styles.regNumber}>{item.regNumber}</Text>
                                    </View>
                                    <Text style={styles.timeText}>
                                        {item.markedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No students marked yet</Text>
                            }
                            contentContainerStyle={styles.listContent}
                        />
                    </View>
                </View>
            </Modal>
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
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    endBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
    },
    endText: {
        ...Typography.label,
        color: Colors.error,
        fontFamily: 'DMSans_700Bold',
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    qrCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 24,
    },
    scanLabel: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    qrWrapper: {
        marginBottom: 20,
    },
    timerText: {
        ...Typography.sectionHeader,
        color: Colors.primaryBlue,
        marginBottom: 8,
    },
    securityHint: {
        ...Typography.label,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    statsSection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        width: '100%',
    },
    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    counterLabel: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    counterValue: {
        ...Typography.display,
        fontSize: 24,
        color: Colors.primaryBlue,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingTop: Platform.OS === 'ios' ? 0 : 10,
        height: 56,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '15',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    listLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listLinkText: {
        ...Typography.buttonText,
        color: Colors.primaryBlue,
        marginRight: 4,
    },
    footer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingBottom: 40,
    },
    endButton: {
        backgroundColor: Colors.error,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    endButtonText: {
        ...Typography.buttonText,
        color: 'white',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
    },
    listContent: {
        paddingBottom: 100,
    },
    recordRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    studentName: {
        ...Typography.body,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    regNumber: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
    timeText: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
    emptyText: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 40,
    },
    successView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    successTitle: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
        marginTop: 20,
        marginBottom: 8,
    },
    successSub: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    backButton: {
        backgroundColor: Colors.primaryBlue,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        ...Typography.buttonText,
        color: 'white',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...Typography.body,
        color: 'white',
        marginTop: 12,
    },
});
