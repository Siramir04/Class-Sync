import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  Platform,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/spacing';
import { AttendanceSession, ProximityScanResult } from '../../types';
import { useAuthStore } from '../../store/authStore';
import * as attendanceService from '../../services/attendanceService';
import { proximityService } from '../../services/proximityService';
import { Button } from '../ui/Button';

const { width } = Dimensions.get('window');

interface AttendanceMarkSheetProps {
    visible: boolean;
    onClose: () => void;
    session: AttendanceSession;
}

export default function AttendanceMarkSheet({ visible, onClose, session }: AttendanceMarkSheetProps) {
    const { colors: Colors } = useTheme();
    const { user } = useAuthStore();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [status, setStatus] = useState<'scanning' | 'detected' | 'fallback' | 'weak' | 'idle'>('idle');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [scanResult, setScanResult] = useState<ProximityScanResult | null>(null);
    const [showCodeInput, setShowCodeInput] = useState(false);

    const themedStyles = styles(Colors);
    
    const ring1 = useRef(new Animated.Value(0)).current;
    const ring2 = useRef(new Animated.Value(0)).current;
    const ring3 = useRef(new Animated.Value(0)).current;
    const inputs = useRef<TextInput[]>([]);

    useEffect(() => {
        if (visible) {
            startScan();
        } else {
            resetSheet();
        }
    }, [visible]);

    const resetSheet = () => {
        setStatus('idle');
        setSuccess(false);
        setScanResult(null);
        setShowCodeInput(false);
        setCode(['', '', '', '', '', '']);
        loading && setLoading(false);
    };

    const startScan = async () => {
        setStatus('scanning');
        startAnimations();

        try {
            const result = await proximityService.checkProximity(
                session,
                (rssi) => {
                    if (rssi < -85) setStatus('weak');
                },
                () => {}
            );

            if (result.detected) {
                setScanResult(result);
                if (result.signalStrength === 'weak') {
                    setStatus('weak');
                } else {
                    handleAutoMark(result);
                }
            } else {
                setStatus('fallback');
            }
        } catch (error) {
            console.error('Scan error:', error);
            setStatus('fallback');
        }
    };

    const startAnimations = () => {
        const animateRing = (val: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(val, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(val, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    })
                ])
            );
        };

        Animated.parallel([
            animateRing(ring1, 0),
            animateRing(ring2, 600),
            animateRing(ring3, 1200)
        ]).start();
    };

    const handleAutoMark = async (result: ProximityScanResult) => {
        setLoading(true);
        try {
            await attendanceService.markAttendance(
                session.spaceId,
                session.courseId,
                session.id,
                session.code, 
                user!.uid,
                user!.fullName,
                false, 
                result.method!,
                result.reading
            );
            setStatus('detected');
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (error: any) {
            console.error('Auto-mark error:', error);
            setStatus('fallback');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (text: string, index: number) => {
        if (text.length > 1) {
          // Handle paste
          const digits = text.split('').slice(0, 6);
          const newCode = [...code];
          digits.forEach((d, i) => { if (index + i < 6) newCode[index + i] = d; });
          setCode(newCode);
          if (index + digits.length < 6) {
            inputs.current[index + digits.length]?.focus();
          } else {
            inputs.current[5]?.focus();
          }
          return;
        }

        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleMarkAttendance = async () => {
        const fullCode = code.join('');
        if (fullCode.length < 6) return;

        setLoading(true);
        try {
            await attendanceService.markAttendance(
                session.spaceId,
                session.courseId,
                session.id,
                fullCode,
                user!.uid,
                user!.fullName,
                false,
                'code'
            );
            setSuccess(true);
            setStatus('detected');
            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to mark attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={themedStyles.overlay}>
                <Pressable style={themedStyles.backdrop} onPress={onClose} />
                <View style={themedStyles.sheet}>
                    <View style={themedStyles.handle} />
                    
                    {success ? (
                        <View style={themedStyles.successView}>
                            <View style={themedStyles.successCircle}>
                                <LucideIcons.Check size={48} color="white" strokeWidth={3} />
                            </View>
                            <Text style={themedStyles.successTitle}>Attendance Marked!</Text>
                            <Text style={themedStyles.successSubtitle}>
                                {session.courseCode} · {new Date().toLocaleDateString()}
                            </Text>
                            <View style={themedStyles.verifyBadge}>
                                <LucideIcons.ShieldCheck size={14} color={Colors.success} />
                                <Text style={themedStyles.verifyBadgeText}>Verified present</Text>
                            </View>
                        </View>
                    ) : (
                        <>
                            {status === 'scanning' ? (
                                <View style={themedStyles.content}>
                                    <View style={themedStyles.headerText}>
                                        <Text style={themedStyles.title}>Verifying presence</Text>
                                        <Text style={themedStyles.subtitle}>{session.courseCode} — {session.lectureName}</Text>
                                    </View>
                                    
                                    <View style={themedStyles.animBox}>
                                        <Animated.View style={[themedStyles.ring, { transform: [{ scale: ring1.interpolate({ inputRange:[0,1], outputRange:[1, 2.5] }) }], opacity: ring1.interpolate({ inputRange:[0, 1], outputRange:[0.5, 0] }) }]} />
                                        <Animated.View style={[themedStyles.ring, { transform: [{ scale: ring2.interpolate({ inputRange:[0,1], outputRange:[1, 2.5] }) }], opacity: ring2.interpolate({ inputRange:[0, 1], outputRange:[0.5, 0] }) }]} />
                                        <Animated.View style={[themedStyles.ring, { transform: [{ scale: ring3.interpolate({ inputRange:[0,1], outputRange:[1, 2.5] }) }], opacity: ring3.interpolate({ inputRange:[0, 1], outputRange:[0.5, 0] }) }]} />
                                        <View style={themedStyles.centerIcon}>
                                            <LucideIcons.Bluetooth size={36} color={Colors.accentBlue} />
                                        </View>
                                    </View>

                                    <Text style={themedStyles.statusLabel}>Connecting to classroom beacon...</Text>
                                    <Button 
                                        label="Enter code manually" 
                                        variant="ghost" 
                                        onPress={() => { setShowCodeInput(true); setStatus('fallback'); }}
                                        style={{ marginTop: 20 }}
                                    />
                                </View>
                            ) : status === 'weak' ? (
                                <View style={themedStyles.content}>
                                    <View style={themedStyles.headerText}>
                                        <Text style={themedStyles.title}>Move closer</Text>
                                        <Text style={themedStyles.subtitle}>You're on the edge of the classroom range</Text>
                                    </View>
                                    <View style={themedStyles.animBox}>
                                        <View style={[themedStyles.centerIcon, { backgroundColor: '#FEF3C7' }]}>
                                            <LucideIcons.SignalHigh size={36} color={Colors.warning} />
                                        </View>
                                    </View>
                                    <Text style={[themedStyles.statusLabel, { color: Colors.warning }]}>Walk toward the front of the room</Text>
                                    <Button 
                                        label="Use code fallback" 
                                        variant="tonal" 
                                        onPress={() => { setStatus('fallback'); setShowCodeInput(true); }}
                                        style={{ marginTop: 32, width: '100%' }}
                                    />
                                </View>
                            ) : (
                                <View style={themedStyles.content}>
                                    <View style={themedStyles.headerText}>
                                        <Text style={themedStyles.title}>{showCodeInput ? 'Enter session code' : 'Beacon not found'}</Text>
                                        <Text style={themedStyles.subtitle}>
                                            {showCodeInput ? 'Ask your Monitor for the 6-digit code' : 'Bluetooth verification failed. Try again or use code.'}
                                        </Text>
                                    </View>

                                    {showCodeInput ? (
                                        <View style={themedStyles.codeContainer}>
                                            <View style={themedStyles.codeInputs}>
                                                {code.map((digit, i) => (
                                                    <TextInput
                                                        key={i}
                                                        ref={(ref) => { inputs.current[i] = ref!; }}
                                                        style={[themedStyles.digitInput, digit !== '' && themedStyles.digitInputFilled]}
                                                        value={digit}
                                                        onChangeText={(text) => handleCodeChange(text, i)}
                                                        onKeyPress={(e) => handleKeyPress(e, i)}
                                                        keyboardType="number-pad"
                                                        maxLength={1}
                                                        selectTextOnFocus
                                                    />
                                                ))}
                                            </View>
                                            <Button 
                                                label="Mark Attendance" 
                                                onPress={handleMarkAttendance}
                                                loading={loading}
                                                style={themedStyles.submitButton}
                                            />
                                            <View style={themedStyles.alertBox}>
                                                <LucideIcons.AlertCircle size={14} color={Colors.textTertiary} />
                                                <Text style={themedStyles.alertText}>Code-only attendance will be flagged for review</Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={themedStyles.errorView}>
                                            <Button label="Scan Again" onPress={startScan} style={{ width: '100%' }} />
                                            <Button 
                                                label="Enter code manually" 
                                                variant="ghost" 
                                                onPress={() => setShowCodeInput(true)} 
                                                style={{ marginTop: 12 }}
                                            />
                                        </View>
                                    )}
                                </View>
                            )}
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = (Colors: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 44 : 32,
        minHeight: 400,
    },
    handle: {
        width: 38,
        height: 5,
        backgroundColor: Colors.separator,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 24,
    },
    content: {
        alignItems: 'center',
    },
    headerText: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
        fontFamily: Typography.family.extraBold,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textTertiary,
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 20,
        fontFamily: Typography.family.regular,
    },
    animBox: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    ring: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary + '25',
        borderWidth: 1,
        borderColor: Colors.primary + '4D',
    },
    centerIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    statusLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textSecondary,
        fontFamily: Typography.family.semiBold,
    },
    codeContainer: {
        width: '100%',
    },
    codeInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    digitInput: {
        width: (width - 48 - 60) / 6,
        height: 60,
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: 14,
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        color: Colors.textPrimary,
        fontFamily: Typography.family.extraBold,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    digitInputFilled: {
        borderColor: Colors.accentBlue,
        backgroundColor: Colors.surface,
    },
    submitButton: {
        width: '100%',
        marginBottom: 20,
    },
    alertBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    alertText: {
        fontSize: 12,
        color: Colors.textTertiary,
        fontFamily: Typography.family.regular,
    },
    successView: {
        alignItems: 'center',
        paddingTop: 20,
    },
    successCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: Colors.success,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            }
        })
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 8,
        fontFamily: Typography.family.extraBold,
    },
    successSubtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        marginBottom: 24,
        fontFamily: Typography.family.regular,
    },
    verifyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.success + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        gap: 6,
    },
    verifyBadgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.success,
        fontFamily: Typography.family.bold,
    },
    errorView: {
        width: '100%',
        alignItems: 'center',
    }
});
