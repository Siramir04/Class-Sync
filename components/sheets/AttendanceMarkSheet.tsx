import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, Platform, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { AttendanceSession, VerificationMethod, ProximityReading, ProximityScanResult } from '../../types';
import { useAuthStore } from '../../store/authStore';
import * as attendanceService from '../../services/attendanceService';
import { proximityService } from '../../services/proximityService';
import Button from '../ui/Button';
import { Animated, Easing } from 'react-native';
import { useEffect } from 'react';

interface AttendanceMarkSheetProps {
    visible: boolean;
    onClose: () => void;
    session: AttendanceSession;
}

export default function AttendanceMarkSheet({ visible, onClose, session }: AttendanceMarkSheetProps) {
    const { user } = useAuthStore();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [status, setStatus] = useState<'scanning' | 'detected' | 'fallback' | 'weak' | 'idle'>('idle');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [scanResult, setScanResult] = useState<ProximityScanResult | null>(null);
    const [showCodeInput, setShowCodeInput] = useState(false);
    
    const pulseAnim = useRef(new Animated.Value(1)).current;
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
                    // Intermediate weak signal check if BLE detected
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
                        duration: 1500,
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
            animateRing(ring2, 500),
            animateRing(ring3, 1000)
        ]).start();
    };

    const handleAutoMark = async (result: ProximityScanResult) => {
        setLoading(true);
        try {
            await attendanceService.markAttendance(
                session.spaceId,
                session.courseId,
                session.id,
                session.code, // Use actual code from session as we've verified proximity
                user!.uid,
                user!.fullName,
                false, // TODO: Carryover check
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
        const newCode = [...code];
        newCode[index] = text.slice(-1); // Take only the last character
        setCode(newCode);

        // Auto-advance
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
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.handle} />
                    
                    {success ? (
                        <View style={styles.successContainer}>
                            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
                            <Text style={styles.successTitle}>You're marked present!</Text>
                            <Text style={styles.successSubtitle}>
                                {session.courseCode} · {new Date().toLocaleDateString()}
                            </Text>
                        </View>
                    ) : (
                        <>
                            {status === 'detected' ? (
                        <View style={styles.successContainer}>
                            <View style={styles.successCircle}>
                                <Ionicons name="checkmark" size={48} color={Colors.success} />
                            </View>
                            <Text style={styles.successTitle}>You're marked present!</Text>
                            <Text style={styles.successSubtitle}>
                                {session.courseCode} · {new Date().toLocaleDateString()}
                            </Text>
                            <View style={styles.methodBadge}>
                                <Ionicons 
                                    name={scanResult?.method === 'ble' ? 'bluetooth' : 'wifi'} 
                                    size={14} 
                                    color={Colors.success} 
                                />
                                <Text style={styles.methodBadgeText}>
                                    Verified by {scanResult?.method === 'ble' ? 'Bluetooth' : 'WiFi'} proximity
                                </Text>
                            </View>
                        </View>
                    ) : status === 'scanning' ? (
                        <View style={styles.scanningContainer}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Marking Attendance</Text>
                                <Text style={styles.subtitle}>{session.courseCode} — {session.lectureName}</Text>
                            </View>
                            
                            <View style={styles.animationContainer}>
                                <Animated.View style={[styles.pulseRing, { transform: [{ scale: ring1.interpolate({ inputRange:[0,1], outputRange:[1, 1.6] }) }], opacity: ring1.interpolate({ inputRange:[0, 1], outputRange:[0.6, 0] }) }]} />
                                <Animated.View style={[styles.pulseRing, { transform: [{ scale: ring2.interpolate({ inputRange:[0,1], outputRange:[1, 1.6] }) }], opacity: ring2.interpolate({ inputRange:[0, 1], outputRange:[0.6, 0] }) }]} />
                                <Animated.View style={[styles.pulseRing, { transform: [{ scale: ring3.interpolate({ inputRange:[0,1], outputRange:[1, 1.6] }) }], opacity: ring3.interpolate({ inputRange:[0, 1], outputRange:[0.6, 0] }) }]} />
                                <View style={styles.pulseCenter}>
                                    <Ionicons name="bluetooth" size={32} color={Colors.primaryBlue} />
                                </View>
                            </View>

                            <Text style={styles.statusText}>Looking for attendance beacon...</Text>
                        </View>
                    ) : status === 'weak' ? (
                        <View style={styles.scanningContainer}>
                             <View style={styles.header}>
                                <Text style={styles.title}>Weak Signal</Text>
                                <Text style={styles.subtitle}>You're on the edge of range</Text>
                            </View>

                            <View style={styles.animationContainer}>
                                <View style={[styles.pulseCenter, { backgroundColor: Colors.warningSoft }]}>
                                    <Ionicons name="bluetooth" size={32} color={Colors.warning} />
                                </View>
                            </View>

                            <Text style={[styles.statusText, { color: Colors.warning }]}>Walk toward the front of the room</Text>
                            
                            <Button 
                                title="Use Code Fallback" 
                                variant="secondary"
                                onPress={() => setStatus('fallback')} 
                                style={styles.fallbackBtn}
                            />
                        </View>
                    ) : (
                        <>
                            <View style={styles.header}>
                                <Text style={styles.title}>Beacon Not Found</Text>
                                <Text style={styles.subtitle}>Move closer or enter the code manually</Text>
                            </View>

                            {showCodeInput ? (
                                <View style={styles.manualEntryContainer}>
                                    <View style={styles.codeRow}>
                                        {code.map((digit, i) => (
                                            <TextInput
                                                key={i}
                                                ref={(ref) => { inputs.current[i] = ref!; }}
                                                style={styles.codeInput}
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
                                        title="Mark Present" 
                                        onPress={handleMarkAttendance}
                                        loading={loading}
                                        style={styles.submitBtn}
                                    />
                                    <Text style={styles.flagWarning}>
                                        Note: Code-only attendance will be flagged for your Monitor
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.notFoundContainer}>
                                    <View style={styles.warningCard}>
                                        <Ionicons name="alert-circle" size={24} color={Colors.warning} />
                                        <Text style={styles.warningCardText}>
                                            Couldn't detect attendance beacon. Ensure Bluetooth is on.
                                        </Text>
                                    </View>
                                    
                                    <Button title="Try Again" onPress={startScan} style={styles.retryBtn} />
                                    <TouchableOpacity onPress={() => setShowCodeInput(true)}>
                                        <Text style={styles.manualLink}>Enter session code manually</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                        </>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingHorizontal: Spacing.screenPadding,
    },
    handle: {
        width: 36,
        height: 5,
        backgroundColor: Colors.border + '60',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
    },
    codeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    codeInput: {
        width: 48,
        height: 56,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border + '30',
        textAlign: 'center',
        fontSize: 24,
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    submitBtn: {
        marginTop: 8,
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    successCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.successSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    successSubtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    methodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.successSoft,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        gap: 6,
    },
    methodBadgeText: {
        fontSize: 13,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.success,
    },
    scanningContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    animationContainer: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 32,
    },
    pulseRing: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primaryBlue + '30',
        borderWidth: 1,
        borderColor: Colors.primaryBlue + '50',
    },
    pulseCenter: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.primaryBlue + '10',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    statusText: {
        fontSize: 15,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    notFoundContainer: {
        width: '100%',
        alignItems: 'center',
    },
    warningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warningSoft,
        padding: 16,
        borderRadius: 16,
        gap: 12,
        marginBottom: 24,
    },
    warningCardText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#854D0E',
    },
    retryBtn: {
        width: '100%',
        marginBottom: 16,
    },
    manualLink: {
        fontSize: 14,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.primaryBlue,
        padding: 8,
    },
    manualEntryContainer: {
        width: '100%',
    },
    flagWarning: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textTertiary,
        textAlign: 'center',
        marginTop: 16,
    },
    fallbackBtn: {
        marginTop: 24,
        width: '100%',
    },
});
