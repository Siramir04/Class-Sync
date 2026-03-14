import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import * as attendanceService from '../../services/attendanceService';
import { proximityService } from '../../services/proximityService';
import { AttendanceSession, AttendanceRecord, VerificationMethod } from '../../types';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { formatRelativeTime } from '../../utils/formatDate';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function LiveAttendanceScreen() {
    const { sessionId, spaceId, courseId } = useLocalSearchParams<{
        sessionId: string;
        spaceId: string;
        courseId: string;
    }>();
    const router = useRouter();

    const [session, setSession] = useState<AttendanceSession | null>(null);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [timeLeft, setTimeLeft] = useState<string>('10:00');
    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [btError, setBtError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId || !spaceId || !courseId) return;

        // Subscribe to session doc
        const sessionRef = doc(db, `spaces/${spaceId}/courses/${courseId}/attendance`, sessionId);
        const unsubSession = onSnapshot(sessionRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as AttendanceSession;
                setSession(data);
                setLoading(false);
            }
        });

        // Subscribe to records
        const unsubRecords = attendanceService.subscribeToRecords(
            spaceId,
            courseId,
            sessionId,
            setRecords
        );

        return () => {
            unsubSession();
            unsubRecords();
        };
    }, [sessionId, spaceId, courseId]);

    // Phase 3: BLE Broadcasting logic
    useEffect(() => {
        if (!session || !session.isOpen || !session.proximityEnabled) return;

        let activeUUID = session.serviceUUID;

        const startBroadcast = async () => {
            try {
                await proximityService.startBeaconBroadcast({
                    sessionId: session.id,
                    spaceId: session.spaceId,
                    courseId: session.courseId,
                    serviceUUID: session.serviceUUID,
                    startedAt: new Date(),
                });
                setIsBroadcasting(true);
                setBtError(null);
            } catch (error) {
                console.error('BLE Broadcast error:', error);
                setIsBroadcasting(false);
                setBtError('Bluetooth unavailable — code only');
            }
        };

        startBroadcast();

        return () => {
            if (activeUUID) {
                proximityService.stopBeaconBroadcast(activeUUID).catch(() => {});
            }
        };
    }, [session?.isOpen, session?.serviceUUID]);

    useEffect(() => {
        if (!session || !session.isOpen) return;

        const interval = setInterval(() => {
            const now = new Date();
            const expiry = new Date(session.codeExpiresAt);
            const diff = expiry.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('00:00');
                clearInterval(interval);
            } else {
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [session]);

    const handleManualVerify = (uid: string, name: string) => {
        Alert.alert(
            'Manual Verification',
            `Verify ${name}'s attendance manually? This will mark them as present and remove the flag.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Verify Student',
                    onPress: async () => {
                        try {
                            await attendanceService.verifyAttendanceRecord(spaceId!, courseId!, sessionId!, uid);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to verify record');
                        }
                    }
                }
            ]
        );
    };

    const handleCloseSession = () => {
        const absentCount = (session?.totalMembers || 0) - records.filter(r => r.isPresent).length;
        
        Alert.alert(
            'Close Session?',
            `This will permanently record attendance. ${absentCount} students will be marked absent.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Close Session',
                    style: 'destructive',
                    onPress: async () => {
                        setClosing(true);
                        try {
                            await attendanceService.closeSession(spaceId!, courseId!, sessionId!);
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to close session');
                        } finally {
                            setClosing(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryBlue} />
        </View>
    );

    if (!session) return null;

    const isExpired = timeLeft === '00:00';
    const timeColor = parseInt(timeLeft.split(':')[0]) < 1 ? Colors.error : 
                      parseInt(timeLeft.split(':')[0]) < 3 ? Colors.warning : Colors.success;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{session.courseCode}</Text>
                    <Text style={styles.headerSubtitle}>{session.lectureName}</Text>
                </View>
                <View style={styles.broadcastIndicator}>
                    {isBroadcasting ? (
                        <>
                            <View style={styles.pulseDot} />
                            <Ionicons name="bluetooth" size={16} color={Colors.success} />
                            <Text style={[styles.broadcastText, { color: Colors.success }]}>Broadcasting</Text>
                        </>
                    ) : btError ? (
                        <>
                            <View style={[styles.pulseDot, { backgroundColor: Colors.warning }]} />
                            <Text style={[styles.broadcastText, { color: Colors.warning }]}>Code only</Text>
                        </>
                    ) : null}
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Code Display */}
                <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>ATTENDANCE CODE</Text>
                    <Text style={[styles.codeText, isExpired && styles.expiredCode]}>
                      {session.code.split('').join(' ')}
                    </Text>
                    
                    <View style={[styles.timerPill, { borderColor: timeColor + '30' }]}>
                        <Ionicons name="time-outline" size={16} color={timeColor} />
                        <Text style={[styles.timerText, { color: timeColor }]}>
                            {isExpired ? 'CODE EXPIRED' : `Expires in ${timeLeft}`}
                        </Text>
                    </View>

                    {isExpired && (
                      <TouchableOpacity style={styles.refreshButton}>
                        <Ionicons name="refresh" size={16} color={Colors.primaryBlue} />
                        <Text style={styles.refreshText}>Generate New Code</Text>
                      </TouchableOpacity>
                    )}
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{records.length}</Text>
                            <Text style={styles.statLabel}>of {session.totalMembers} present</Text>
                        </View>
                    </View>
                    
                    <View style={styles.verificationSummary}>
                        <View style={styles.summaryItem}>
                            <View style={[styles.summaryDot, { backgroundColor: Colors.success }]} />
                            <Text style={styles.summaryText}>{records.filter(r => r.verificationMethod === 'ble').length} BLE</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <View style={[styles.summaryDot, { backgroundColor: '#EAB308' }]} />
                            <Text style={styles.summaryText}>{records.filter(r => r.verificationMethod === 'wifi').length} WiFi</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <View style={[styles.summaryDot, { backgroundColor: Colors.warning }]} />
                            <Text style={styles.summaryText}>{records.filter(r => r.verificationMethod === 'code').length} Code only</Text>
                        </View>
                    </View>
                </View>

                {/* Live List */}
                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>Recently Marked</Text>
                    {records.length === 0 ? (
                        <View style={styles.emptyList}>
                            <Text style={styles.emptyText}>Waiting for students to join...</Text>
                        </View>
                    ) : (
                        records.map((record) => (
                            <TouchableOpacity 
                                key={record.uid} 
                                style={[styles.recordRow, record.isFlagged && styles.flaggedRow]}
                                onPress={() => record.isFlagged && handleManualVerify(record.uid, record.fullName)}
                                disabled={!record.isFlagged}
                            >
                                <Avatar name={record.fullName} size={40} />
                                <View style={styles.recordInfo}>
                                    <View style={styles.nameRow}>
                                      <Text style={styles.recordName}>{record.fullName}</Text>
                                      {record.isCarryover && (
                                        <View style={styles.carryoverBadge}>
                                          <Text style={styles.carryoverText}>CO</Text>
                                        </View>
                                      )}
                                    </View>
                                    <View style={styles.recordDetailsRow}>
                                        <Text style={styles.recordTime}>
                                            {formatRelativeTime(record.markedAt instanceof Date ? record.markedAt : (record.markedAt as any).toDate())}
                                        </Text>
                                        {record.isFlagged && (
                                            <Text style={styles.tapToVerify}> • Tap to verify</Text>
                                        )}
                                    </View>
                                </View>
                                
                                <View style={styles.badgeContainer}>
                                    {record.verificationMethod === 'ble' && (
                                        <View style={[styles.vBadge, styles.bleBadge]}>
                                            <Ionicons name="bluetooth" size={10} color={Colors.success} />
                                            <Text style={styles.bleBadgeText}>BLE</Text>
                                        </View>
                                    )}
                                    {record.verificationMethod === 'wifi' && (
                                        <View style={[styles.vBadge, styles.wifiBadge]}>
                                            <Ionicons name="wifi" size={10} color="#854D0E" />
                                            <Text style={styles.wifiBadgeText}>WiFi</Text>
                                        </View>
                                    )}
                                    {record.verificationMethod === 'code' && (
                                        <View style={[styles.vBadge, styles.codeBadge]}>
                                            <Ionicons name="alert-circle" size={10} color={Colors.warning} />
                                            <Text style={styles.codeBadgeText}>Code only</Text>
                                        </View>
                                    )}
                                    {record.verificationMethod === 'manual' && (
                                         <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button 
                    title="Close Attendance Session" 
                    variant="danger" 
                    onPress={handleCloseSession}
                    loading={closing}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        height: 56,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '15',
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
    },
    broadcastIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
        gap: 6,
    },
    broadcastText: {
        fontSize: 11,
        fontFamily: 'DMSans_700Bold',
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.success,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    codeContainer: {
        backgroundColor: Colors.surface,
        margin: Spacing.screenPadding,
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    codeLabel: {
        ...Typography.label,
        color: Colors.textTertiary,
        marginBottom: 16,
    },
    codeText: {
        fontSize: 48,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: Colors.accentBlue,
        letterSpacing: 8,
        marginBottom: 20,
    },
    expiredCode: {
        color: Colors.textTertiary,
        textDecorationLine: 'line-through',
    },
    timerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1,
        gap: 6,
    },
    timerText: {
        fontSize: 13,
        fontFamily: 'DMSans_700Bold',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        gap: 6,
    },
    refreshText: {
        fontSize: 14,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.primaryBlue,
    },
    statsContainer: {
        backgroundColor: Colors.surface,
        marginHorizontal: Spacing.screenPadding,
        paddingBottom: 20,
        borderRadius: 24,
        marginTop: -12,
        marginBottom: 24,
    },
    verificationSummary: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 8,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    summaryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    summaryText: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textSecondary,
    },
    statsRow: {
        alignItems: 'center',
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 48,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
        marginTop: -4,
    },
    listSection: {
        paddingHorizontal: Spacing.screenPadding,
    },
    sectionTitle: {
        ...Typography.subHeader,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    recordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    flaggedRow: {
        backgroundColor: Colors.warningSoft,
        borderColor: Colors.warning + '20',
    },
    recordDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tapToVerify: {
        fontSize: 12,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.warning,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    vBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    bleBadge: {
        backgroundColor: '#DCFCE7',
    },
    bleBadgeText: {
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
        color: Colors.success,
    },
    wifiBadge: {
        backgroundColor: '#FEF9C3',
    },
    wifiBadgeText: {
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
        color: '#854D0E',
    },
    codeBadge: {
        backgroundColor: '#FEF3C7',
    },
    codeBadgeText: {
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
        color: Colors.warning,
    },
    recordInfo: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    recordName: {
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
    },
    recordTime: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textTertiary,
    },
    carryoverBadge: {
      backgroundColor: Colors.carryover + '15',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    carryoverText: {
      fontSize: 10,
      fontFamily: 'DMSans_700Bold',
      color: Colors.carryover,
    },
    emptyList: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textTertiary,
        fontStyle: 'italic',
    },
    footer: {
        padding: Spacing.screenPadding,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border + '15',
    },
});
