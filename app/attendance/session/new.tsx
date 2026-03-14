import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing } from '../../../constants/spacing';
import { startSession } from '../../../services/attendanceService';
import { proximityService } from '../../../services/proximityService';
import { useAuthStore } from '../../../store/authStore';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

/**
 * Attendance Session Creation Screen
 * Replaces the missing app/attendance/session/new.tsx
 */
export default function NewSessionScreen() {
    const { courseId, spaceId, courseCode, courseName } = useLocalSearchParams<{
        courseId: string;
        spaceId: string;
        courseCode: string;
        courseName: string;
    }>();
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const handleStartSession = async () => {
        if (!user || !courseId || !spaceId) return;

        setLoading(true);
        try {
            // Phase 3: Check if Bluetooth is available before starting
            // Note: On actual device this checks if BT is on. 
            // If it fails (e.g. permission denied or off), we show advisory.
            const btPermission = await proximityService.requestProximityPermissions();
            
            if (!btPermission) {
                Alert.alert(
                    'Bluetooth Required',
                    'ClassSync needs Bluetooth to verify proximity. Attendance will continue with code verification only.',
                    [{ text: 'Continue with code only' }]
                );
            }

            // Fetch total members for this course to initialize stats
            const membersRef = collection(db, `spaces/${spaceId}/courses/${courseId}/members`);
            const membersSnap = await getDocs(membersRef);
            const totalMembers = membersSnap.size;

            const sessionId = await startSession(
                spaceId,
                courseId,
                courseCode || '',
                decodeURIComponent(courseName || ''),
                user.uid,
                totalMembers
            );
            
            // Redirect to the live session screen
            router.replace(`/attendance/${sessionId}?spaceId=${spaceId}&courseId=${courseId}`);
        } catch (error: any) {
            console.error('Failed to start session:', error);
            Alert.alert('Error', error.message || 'Could not start attendance session.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Start Attendance</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>COURSE</Text>
                    <Text style={styles.courseTitle}>{decodeURIComponent(courseName || 'Selected Course')}</Text>
                    <Text style={styles.courseCode}>{courseCode}</Text>
                </View>

                <Card style={styles.instructionCard}>
                    <View style={styles.instructionRow}>
                        <View style={[styles.iconBox, { backgroundColor: Colors.primaryBlue + '10' }]}>
                            <Ionicons name="qr-code" size={20} color={Colors.primaryBlue} />
                        </View>
                        <View style={styles.instructionTextContent}>
                            <Text style={styles.instructionTitle}>Dynamic QR Code</Text>
                            <Text style={styles.instructionSubtitle}>
                                A secure QR code will be generated. It refreshes every 60 seconds to prevent spoofing.
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.instructionRow, { marginTop: 24 }]}>
                        <View style={[styles.iconBox, { backgroundColor: Colors.success + '10' }]}>
                            <Ionicons name="people" size={20} color={Colors.success} />
                        </View>
                        <View style={styles.instructionTextContent}>
                            <Text style={styles.instructionTitle}>Live List</Text>
                            <Text style={styles.instructionSubtitle}>
                                See students join the session in real-time as they scan the code.
                            </Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.warningBox}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.textTertiary} />
                    <Text style={styles.warningText}>
                        Students must be present physically to scan the code from your device.
                    </Text>
                </View>

                <Button
                    title="Generate QR & Start Session"
                    onPress={handleStartSession}
                    loading={loading}
                    style={styles.actionButton}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 56,
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: 24,
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    label: {
        fontSize: 11,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textTertiary,
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    courseTitle: {
        fontSize: 22,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    courseCode: {
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.primaryBlue,
        marginTop: 4,
    },
    instructionCard: {
        padding: 20,
        marginBottom: 24,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    instructionTextContent: {
        flex: 1,
    },
    instructionTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    instructionSubtitle: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    warningBox: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        marginBottom: 40,
        gap: 10,
        alignItems: 'center',
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textTertiary,
    },
    actionButton: {
        height: 56,
        borderRadius: 16,
    },
});
