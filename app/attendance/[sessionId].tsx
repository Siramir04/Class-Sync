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
import { useTheme } from '../../hooks/useTheme';
import * as attendanceService from '../../services/attendanceService';
import { proximityService } from '../../services/proximityService';
import { AttendanceSession, AttendanceRecord } from '../../types';
import { Button } from '../../components/ui/Button';
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
    const { colors: Colors, typography: Typography, isDark } = useTheme();

    const [session, setSession] = useState<AttendanceSession | null>(null);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [timeLeft, setTimeLeft] = useState<string>('10:00');
    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [btError, setBtError] = useState<string | null>(null);

    const themedStyles = styles(Colors, Typography, isDark);

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
                      parseInt(timeLeft.split(':')[0]) < 3 ? Colors.warning : Colors.primary;

    const bleCount = records.filter(r => r.verificationMethod === 'ble').length;
    const wifiCount = records.filter(r => r.verificationMethod === 'wifi').length;
    const codeCount = records.filter(r => r.verificationMethod === 'code').length;

    return (
      <View style={themedStyles.container}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        
        {/* Header */}
        <View style={[themedStyles.header, { paddingTop: insets.top + 10 }]}>
           <Pressable onPress={() => router.back()} style={themedStyles.headerButton}>
             <LucideIcons.X size={24} color={Colors.onSurface} />
           </Pressable>
           <View style={themedStyles.headerTitleContainer}>
              <Text style={themedStyles.headerTitle}>{session?.courseCode}</Text>
              <Text style={themedStyles.headerSubtitle}>{session?.lectureName}</Text>
           </View>
           <View style={themedStyles.broadcastBox}>
              <View style={[themedStyles.pulseDot, { backgroundColor: isBroadcasting ? Colors.primary : Colors.warning }]} />
              <Text style={[themedStyles.broadcastText, { color: isBroadcasting ? Colors.primary : Colors.warning }]}>
                {isBroadcasting ? 'Live' : 'Code'}
              </Text>
           </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          {/* Main Code View */}
          <View style={themedStyles.hero}>
             <View style={themedStyles.codeCard}>
                <Text style={themedStyles.cardLabel}>SESSION CODE</Text>
                <Text style={[themedStyles.codeValue, isExpired && themedStyles.codeExpired]}>
                  {session?.code.split('').join(' ')}
                </Text>
                <View style={[themedStyles.timerPill, { backgroundColor: timeColor + '15' }]}>
                   <LucideIcons.Clock size={14} color={timeColor} />
                   <Text style={[themedStyles.timerValue, { color: timeColor }]}>
                     {isExpired ? 'EXPIRED' : `${timeLeft} remaining`}
                   </Text>
                </View>
             </View>
          </View>

          {/* Stats Bar */}
          <View style={themedStyles.statsStrip}>
             <View style={themedStyles.statBox}>
                <Text style={themedStyles.statNumber}>{records.length}</Text>
                <Text style={themedStyles.statLabel}>Present</Text>
             </View>
             <View style={themedStyles.statDivider} />
             <View style={themedStyles.statBox}>
                <Text style={themedStyles.statNumber}>{(session?.totalMembers || 0) - records.length}</Text>
                <Text style={themedStyles.statLabel}>Pending</Text>
             </View>
             <View style={themedStyles.statDivider} />
             <View style={themedStyles.statBox}>
                <Text style={themedStyles.statNumber}>{Math.round((records.length / (session?.totalMembers || 1)) * 100)}%</Text>
                <Text style={themedStyles.statLabel}>Attendance</Text>
             </View>
          </View>

          {/* Verification Methods */}
          <View style={themedStyles.methodStrip}>
             <View style={themedStyles.methodItem}>
                <LucideIcons.Bluetooth size={12} color={Colors.primary} />
                <Text style={themedStyles.methodText}>{bleCount} BLE</Text>
             </View>
             <View style={themedStyles.methodItem}>
                <LucideIcons.Wifi size={12} color="#EAB308" />
                <Text style={themedStyles.methodText}>{wifiCount} WiFi</Text>
             </View>
             <View style={themedStyles.methodItem}>
                <LucideIcons.Type size={12} color={Colors.warning} />
                <Text style={themedStyles.methodText}>{codeCount} Code</Text>
             </View>
          </View>

          {/* Records List */}
          <View style={themedStyles.listSection}>
             <Text style={themedStyles.sectionTitle}>Recent activity</Text>
             {records.length === 0 ? (
                <View style={themedStyles.emptyView}>
                   <LucideIcons.Users size={40} color={Colors.outlineVariant} />
                   <Text style={themedStyles.emptyText}>Waiting for students...</Text>
                </View>
             ) : (
                <View style={themedStyles.recordsGroup}>
                   {records.map((record, index) => {
                    return (
                      <Pressable 
                        key={record.uid} 
                        style={({ pressed }) => [
                           themedStyles.recordRow,
                           pressed && record.isFlagged && { opacity: 0.7 },
                           record.isFlagged && themedStyles.recordRowFlagged
                        ]}
                        onPress={() => record.isFlagged && handleManualVerify(record.uid, record.fullName)}
                      >
                         <Avatar firstName={record.fullName.split(' ')[0]} lastName={record.fullName.split(' ')[1] || ''} size="md" />
                         <View style={themedStyles.recordContent}>
                            <View style={themedStyles.nameRow}>
                               <Text style={themedStyles.recordName}>{record.fullName}</Text>
                               {record.isCarryover && (
                                 <View style={themedStyles.coBadge}><Text style={themedStyles.coText}>CO</Text></View>
                               )}
                            </View>
                            <Text style={themedStyles.recordTime}>
                               {formatRelativeTime(record.markedAt instanceof Date ? record.markedAt : (record.markedAt as any).toDate())}
                               {record.isFlagged && ' · Flagged for review'}
                            </Text>
                         </View>
                         <View style={themedStyles.recordTrailing}>
                            {record.verificationMethod === 'ble' && <LucideIcons.Bluetooth size={16} color={Colors.primary} />}
                            {record.verificationMethod === 'wifi' && <LucideIcons.Wifi size={16} color="#EAB308" />}
                            {record.verificationMethod === 'code' && <LucideIcons.AlertTriangle size={16} color={Colors.warning} />}
                            {record.verificationMethod === 'manual' && <LucideIcons.CheckCircle2 size={16} color={Colors.primary} />}
                         </View>
                      </Pressable>
                    );
                   })}
                </View>
             )}
          </View>
        </ScrollView>

        <View style={[themedStyles.footer, { paddingBottom: insets.bottom + 16 }]}>
           <Button 
             label="End Attendance Session" 
             variant="danger" 
             onPress={handleCloseSession}
             loading={closing}
             style={{ height: 54 }}
           />
        </View>
      </View>
    );
}

const styles = (Colors: any, Typography: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant,
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
    color: Colors.onSurface,
    fontFamily: Typography.family.extraBold,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.family.regular,
  },
  broadcastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
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
    backgroundColor: isDark ? Colors.surfaceVariant : '#000',
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
    color: isDark ? Colors.onSurfaceVariant : 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginBottom: 16,
    fontFamily: Typography.family.extraBold,
  },
  codeValue: {
    fontSize: 56,
    fontWeight: '900',
    color: isDark ? Colors.onSurface : 'white',
    letterSpacing: 8,
    fontFamily: Typography.family.extraBold,
    marginBottom: 24,
  },
  codeExpired: {
    color: isDark ? Colors.onSurfaceVariant : 'rgba(255,255,255,0.2)',
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
    color: Colors.onSurface,
    fontFamily: Typography.family.extraBold,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
    fontFamily: Typography.family.regular,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.outlineVariant,
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
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.family.semiBold,
  },
  listSection: {
    paddingHorizontal: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 16,
    fontFamily: Typography.family.bold,
  },
  recordsGroup: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 24,
    overflow: 'hidden',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant,
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
    color: Colors.onSurface,
    fontFamily: Typography.family.semiBold,
  },
  coBadge: {
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.onTertiaryContainer,
  },
  recordTime: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
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
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.family.regular,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Colors.surface,
    paddingHorizontal: 22,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: Colors.outlineVariant,
  }
});
