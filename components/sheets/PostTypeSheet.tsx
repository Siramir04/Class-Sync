import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { PostType } from '../../types';

interface PostTypeSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (type: PostType) => void;
    filterToLecture?: boolean;
}

interface PostTypeOption {
    type: PostType;
    label: string;
    icon: string;
    color: string;
    description: string;
}

const allOptions: PostTypeOption[] = [
    { type: 'lecture', label: 'Schedule Lecture', icon: 'calendar', color: Colors.primaryBlue, description: 'Fix a time and venue for a new lecture' },
    { type: 'assignment', label: 'Post Assignment', icon: 'document-text', color: Colors.warning, description: 'Share coursework with a due date' },
    { type: 'test', label: 'Schedule Test', icon: 'clipboard', color: Colors.error, description: 'Announce an upcoming quiz or exam' },
    { type: 'note', label: 'Post Note', icon: 'bookmark', color: Colors.success, description: 'Share study materials or quick reminders' },
    { type: 'announcement', label: 'Announcement', icon: 'megaphone', color: Colors.accentBlue, description: 'Broadcast important class information' },
    { type: 'cancellation', label: 'Cancel Class', icon: 'close-circle', color: Colors.error, description: 'Notify members of a cancelled lecture' },
    { type: 'attendance', label: 'Start Attendance', icon: 'qr-code', color: Colors.primaryBlue, description: 'Generate a QR code for live tracking' },
];

export default function PostTypeSheet({
    visible,
    onClose,
    onSelect,
    filterToLecture = false,
}: PostTypeSheetProps) {
    const options = filterToLecture
        ? allOptions.filter((o) => o.type === 'lecture')
        : allOptions;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.keyboardSpacer}>
                    <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.handle} />
                        <View style={styles.header}>
                            <Text style={styles.title}>Create Post</Text>
                            <Text style={styles.subtitle}>Select the type of update you want to share</Text>
                        </View>
                        
                        <View style={styles.optionsContainer}>
                            {options.map((option) => (
                                <TouchableOpacity
                                    key={option.type}
                                    style={styles.option}
                                    onPress={() => {
                                        onSelect(option.type);
                                        onClose();
                                    }}
                                    activeOpacity={0.6}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: option.color + '12' }]}>
                                        <Ionicons
                                            name={option.icon as any}
                                            size={22}
                                            color={option.color}
                                        />
                                    </View>
                                    <View style={styles.optionContent}>
                                        <Text style={styles.optionLabel}>{option.label}</Text>
                                        <Text style={styles.optionDescription} numberOfLines={1}>
                                            {option.description}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
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
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingHorizontal: Spacing.screenPadding,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 20,
            },
        }),
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
        marginBottom: 20,
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
    optionsContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border + '15',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '10',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    optionDescription: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textTertiary,
    },
    cancelBtn: {
        marginTop: 16,
        height: 56,
        borderRadius: 16,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border + '15',
    },
    cancelBtnText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textSecondary,
    },
});
