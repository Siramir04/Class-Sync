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
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/spacing';
import { Button } from '../ui/Button';
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
    const { colors: Colors } = useTheme();
    const themedStyles = styles(Colors);
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <Pressable style={themedStyles.overlay} onPress={onDismiss}>
                <View style={themedStyles.keyboardSpacer}>
                    <Pressable style={themedStyles.sheet} onPress={(e) => e.stopPropagation()}>
                        <View style={themedStyles.handle} />
                        
                        <View style={themedStyles.iconCircle}>
                            <Ionicons name="notifications" size={32} color={Colors.primary} />
                        </View>
                        
                        <View style={themedStyles.header}>
                            <Text style={themedStyles.title}>New Course Added</Text>
                            <Text style={themedStyles.subtitle}>{courseName}</Text>
                        </View>

                        <View style={themedStyles.infoRow}>
                            <View style={themedStyles.badge}>
                                <Text style={themedStyles.badgeText}>{courseCode}</Text>
                            </View>
                            <View style={themedStyles.dot} />
                            <Text style={themedStyles.daysText}>
                                Auto-adds in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                            </Text>
                        </View>

                        <Text style={themedStyles.description}>
                            This course was recently created for your department. You can accept it now to start tracking attendance and receiving notifications immediately.
                        </Text>

                        <View style={themedStyles.footer}>
                            <Button 
                                label="Accept Now" 
                                onPress={onAccept} 
                                style={themedStyles.acceptBtn} 
                            />
                            <TouchableOpacity style={themedStyles.dismissBtn} onPress={onDismiss}>
                                <Text style={themedStyles.dismissBtnText}>Let it auto-add later</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = (Colors: any) => StyleSheet.create({
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
        backgroundColor: Colors.surface,
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
        backgroundColor: Colors.separator,
        borderRadius: 3,
        marginBottom: 20,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary + '10',
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
        fontFamily: Typography.family.bold,
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: Typography.family.medium,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    badge: {
        backgroundColor: Colors.primary + '12',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontFamily: Typography.family.bold,
        color: Colors.primary,
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
        fontFamily: Typography.family.bold,
        color: Colors.warning,
    },
    description: {
        fontSize: 14,
        fontFamily: Typography.family.regular,
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
        fontFamily: Typography.family.semiBold,
        color: Colors.textTertiary,
    },
});
