import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';
import * as attendanceService from '../../services/attendanceService';
import { proximityService } from '../../services/proximityService';
import { AttendanceSession, AttendanceRecord } from '../../types';
import Button from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { formatRelativeTime } from '../../utils/formatDate';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

const { width } = Dimensions.get('window');

export default function LiveAttendanceScreen() {
    const { sessionId, spaceId, courseId } = useLocalSearchParams<{
        sessionId: string;
        spaceId: string;
        courseId: string;
    }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [session, setSession] = useState<AttendanceSession | null>(null);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [timeLeft, setTimeLeft] = useState<string>('10:00');
    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [btError, setBtError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId || !spaceId || !courseId) return;

        const sessionRef = doc(db, `spaces/${spaceId}/courses/${courseId}/attendance`, sessionId);
        const unsubSession = onSnapshot(sessionRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as AttendanceSession;
                setSession(data);
                setLoading(false);
            }
        });

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
            `Verify ${name}'s attendance manually?`,
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

    if (!session && !loading) return null;

    const isExpired = timeLeft === '00:00';
    const timeColor = parseInt(timeLeft.split(':')[0]) < 1 ? Colors.error : 
                      parseInt(timeLeft.split(':')[0]) < 3 ? Colors.warning : Colors.success;

    const bleCount = records.filter(r => r.verificationMethod === 'ble').length;
    const wifiCount = records.filter(r => r.verificationMethod === 'wifi').length;
    const codeCount = records.filter(r => r.verificationMethod === 'code').length;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
           <Pressable onPress={() => router.back()} style={styles.headerButton}>
             <LucideIcons.X size={24} color="#000" />
           </Pressable>
           <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{session?.courseCode}</Text>
              <Text style={styles.headerSubtitle}>{session?.lectureName}</Text>
           </View>
           <View style={styles.broadcastBox}>
              <View style={[styles.pulseDot, { backgroundColor: isBroadcasting ? Colors.success : Colors.warning }]} />
              <Text style={[styles.broadcastText, { color: isBroadcasting ? Colors.success : Colors.warning }]}>
                {isBroadcasting ? 'Live' : 'Code'}
              </Text>
           </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          {/* Main Code View */}
          <View style={styles.hero}>
             <View style={styles.codeCard}>
                <Text style={styles.cardLabel}>SESSION CODE</Text>
                <Text style={[styles.codeValue, isExpired && styles.codeExpired]}>
                  {session?.code.split('').join(' ')}
                </Text>
                <View style={[styles.timerPill, { backgroundColor: timeColor + '10' }]}>
                   <LucideIcons.Clock size={14} color={timeColor} />
                   <Text style={[styles.timerValue, { color: timeColor }]}>
                     {isExpired ? 'EXPIRED' : `${timeLeft} remaining`}
                   </Text>
                </View>
             </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsStrip}>
             <View style={styles.statBox}>
               <Text style={styles.statNumber}>{records.length}</Text>
               <Text style={styles.statLabel}>Present</Text>
             </View>
             <View style={styles.statDivider} />
             <View style={styles.statBox}>
               <Text style={styles.statNumber}>{(session?.totalMembers || 0) - records.length}</Text>
               <Text style={styles.statLabel}>Pending</Text>
             </View>
             <View style={styles.statDivider} />
             <View style={styles.statBox}>
               <Text style={styles.statNumber}>{Math.round((records.length / (session?.totalMembers || 1)) * 100)}%</Text>
               <Text style={styles.statLabel}>Attendance</Text>
             </View>
          </View>

          {/* Verification Methods */}
          <View style={styles.methodStrip}>
             <View style={styles.methodItem}>
                <LucideIcons.Bluetooth size={12} color={Colors.success} />
                <Text style={styles.methodText}>{bleCount} BLE</Text>
             </View>
             <View style={styles.methodItem}>
                <LucideIcons.Wifi size={12} color="#EAB308" />
                <Text style={styles.methodText}>{wifiCount} WiFi</Text>
             </View>
             <View style={styles.methodItem}>
                <LucideIcons.Type size={12} color={Colors.warning} />
                <Text style={styles.methodText}>{codeCount} Code</Text>
             </View>
          </View>

          {/* Records List */}
          <View style={styles.listSection}>
             <Text style={styles.sectionTitle}>Recent activity</Text>
             {records.length === 0 ? (
                <View style={styles.emptyView}>
                  <LucideIcons.Users size={40} color={Colors.separatorOpaque} />
                  <Text style={styles.emptyText}>Waiting for students...</Text>
                </View>
             ) : (
                <View style={styles.recordsGroup}>
                  {records.map((record, index) => {
                    const isLast = index === records.length - 1;
                    return (
                      <Pressable 
                        key={record.uid} 
                        style={({ pressed }) => [
                           styles.recordRow,
                           pressed && record.isFlagged && { opacity: 0.7 },
                           record.isFlagged && styles.recordRowFlagged
                        ]}
                        onPress={() => record.isFlagged && handleManualVerify(record.uid, record.fullName)}
                      >
                         <Avatar firstName={record.fullName.split(' ')[0]} lastName={record.fullName.split(' ')[1] || ''} size="md" />
                         <View style={styles.recordContent}>
                            <View style={styles.nameRow}>
                               <Text style={styles.recordName}>{record.fullName}</Text>
                               {record.isCarryover && (
                                 <View style={styles.coBadge}><Text style={styles.coText}>CO</Text></View>
                               )}
                            </View>
                            <Text style={styles.recordTime}>
                               {formatRelativeTime(record.markedAt instanceof Date ? record.markedAt : (record.markedAt as any).toDate())}
                               {record.isFlagged && ' · Flagged for review'}
                            </Text>
                         </View>
                         <View style={styles.recordTrailing}>
                            {record.verificationMethod === 'ble' && <LucideIcons.Bluetooth size={16} color={Colors.success} />}
                            {record.verificationMethod === 'wifi' && <LucideIcons.Wifi size={16} color="#EAB308" />}
                            {record.verificationMethod === 'code' && <LucideIcons.AlertTriangle size={16} color={Colors.warning} />}
                            {record.verificationMethod === 'manual' && <LucideIcons.CheckCircle2 size={16} color={Colors.success} />}
                         </View>
                      </Pressable>
                    );
                  })}
                </View>
             )}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
           <Button 
             title="End Attendance Session" 
             variant="danger" 
             onPress={handleCloseSession}
             loading={closing}
             style={{ height: 54 }}
           />
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  headerBox: {
    flex: 1,
    alignItems: 'center',
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    fontFamily: Typography.family.extraBold,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: Typography.family.regular,
  },
  broadcastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  broadcastText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.family.bold,
  },
  hero: {
    padding: 22,
  },
  codeCard: {
    backgroundColor: '#000',
    borderRadius: 28,
    paddingVertical: 40,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      }
    })
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginBottom: 16,
    fontFamily: Typography.family.extraBold,
  },
  codeValue: {
    fontSize: 56,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 8,
    fontFamily: Typography.family.extraBold,
    marginBottom: 24,
  },
  codeExpired: {
    color: 'rgba(255,255,255,0.2)',
    textDecorationLine: 'line-through',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    gap: 6,
  },
  timerValue: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Typography.family.bold,
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    fontFamily: Typography.family.extraBold,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
    fontFamily: Typography.family.regular,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.separator,
    alignSelf: 'center',
  },
  methodStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontFamily: Typography.family.semiBold,
  },
  listSection: {
    paddingHorizontal: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    fontFamily: Typography.family.bold,
  },
  recordsGroup: {
    backgroundColor: '#F9F9FB',
    borderRadius: 24,
    overflow: 'hidden',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.separator,
  },
  recordRowFlagged: {
    backgroundColor: 'rgba(255,149,0,0.05)',
  },
  recordContent: {
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
    fontWeight: '600',
    color: '#000',
    fontFamily: Typography.family.semiBold,
  },
  coBadge: {
    backgroundColor: Colors.carryoverSoft,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.carryover,
  },
  recordTime: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
    fontFamily: Typography.family.regular,
  },
  recordTrailing: {
    width: 24,
    alignItems: 'center',
  },
  emptyView: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontFamily: Typography.family.regular,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    paddingHorizontal: 22,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: Colors.separator,
  }
});
