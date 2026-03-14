import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import Button from '../ui/Button';
import { Ionicons } from '@expo/vector-icons';

interface CourseAcceptSheetProps {
    visible: boolean;
    courseCode: string;
    courseName: string;
    daysRemaining: number;
    onAccept: () => void;
    onDismiss: () => void;
}

export default function CourseAcceptSheet({
    visible,
    courseCode,
    courseName,
    daysRemaining,
    onAccept,
    onDismiss,
}: CourseAcceptSheetProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <Pressable style={styles.overlay} onPress={onDismiss}>
                <View style={styles.keyboardSpacer}>
                    <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.handle} />
                        
                        <View style={styles.iconCircle}>
                            <Ionicons name="notifications" size={32} color={Colors.primaryBlue} />
                        </View>
                        
                        <View style={styles.header}>
                            <Text style={styles.title}>New Course Added</Text>
                            <Text style={styles.subtitle}>{courseName}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{courseCode}</Text>
                            </View>
                            <View style={styles.dot} />
                            <Text style={styles.daysText}>
                                Auto-adds in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                            </Text>
                        </View>

                        <Text style={styles.description}>
                            This course was recently created for your department. You can accept it now to start tracking attendance and receiving notifications immediately.
                        </Text>

                        <View style={styles.footer}>
                            <Button 
                                title="Accept Now" 
                                onPress={onAccept} 
                                style={styles.acceptBtn} 
                            />
                            <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
                                <Text style={styles.dismissBtnText}>Let it auto-add later</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </View>
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
    keyboardSpacer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPadding,
    },
    sheet: {
        backgroundColor: Colors.background,
        borderRadius: 28,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    handle: {
        width: 36,
        height: 5,
        backgroundColor: Colors.border + '60',
        borderRadius: 3,
        marginBottom: 20,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primaryBlue + '10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 22,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    badge: {
        backgroundColor: Colors.primaryBlue + '12',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: Colors.primaryBlue,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.textTertiary,
        marginHorizontal: 8,
    },
    daysText: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: Colors.warning,
    },
    description: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    footer: {
        width: '100%',
    },
    acceptBtn: {
        height: 56,
        borderRadius: 16,
        marginBottom: 12,
    },
    dismissBtn: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dismissBtnText: {
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textTertiary,
    },
});
