import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Platform, Dimensions } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { PostType } from '../../types';

interface PostTypeSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (type: PostType) => void;
    filterToLecture?: boolean;
    isStudent?: boolean;
}

interface PostTypeOption {
    type: PostType;
    label: string;
    icon: keyof typeof LucideIcons;
    color: string;
    description: string;
}

const allOptions: PostTypeOption[] = [
    { type: 'lecture', label: 'Schedule Lecture', icon: 'BookOpen', color: Colors.accentBlue, description: 'Fix a time and venue for a new lecture' },
    { type: 'assignment', label: 'Post Assignment', icon: 'FileText', color: Colors.warning, description: 'Share coursework with a due date' },
    { type: 'attendance', label: 'Start Attendance', icon: 'QrCode', color: Colors.success, description: 'Real-time proximity tracking' },
    { type: 'test', label: 'Schedule Test', icon: 'ClipboardCheck', color: Colors.error, description: 'Announce an upcoming quiz or exam' },
    { type: 'announcement', label: 'Announcement', icon: 'Megaphone', color: Colors.accentBlue, description: 'Broadcast important class information' },
    { type: 'note', label: 'Post Note', icon: 'Bookmark', color: Colors.success, description: 'Share study materials or quick reminders' },
    { type: 'cancellation', label: 'Cancel Class', icon: 'XCircle', color: Colors.error, description: 'Notify members of a cancelled lecture' },
];

export default function PostTypeSheet({
    visible,
    onClose,
    onSelect,
    filterToLecture = false,
    isStudent = false,
}: PostTypeSheetProps) {
    let options = allOptions;
    if (filterToLecture) {
        options = allOptions.filter((o) => o.type === 'lecture');
    } else if (isStudent) {
        options = allOptions.filter((o) => o.type === 'note').map(o => ({
            ...o,
            label: 'Share Material/Link',
            description: 'Post helpful resources for your course mates'
        }));
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <Text style={styles.title}>What's happening?</Text>
                        <Text style={styles.subtitle}>Select the type of update to share</Text>
                    </View>
                    
                    <View style={styles.optionsList}>
                        {options.map((option, index) => {
                            const IconComponent = LucideIcons[option.icon] as any;
                            const isLast = index === options.length - 1;
                            return (
                                <Pressable
                                    key={option.type}
                                    style={({ pressed }) => [
                                        styles.option,
                                        pressed && { backgroundColor: '#F2F2F7' }
                                    ]}
                                    onPress={() => {
                                        onSelect(option.type);
                                        onClose();
                                    }}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: option.color + '10' }]}>
                                        <IconComponent
                                            size={20}
                                            color={option.color}
                                        />
                                    </View>
                                    <View style={styles.optionContent}>
                                        <Text style={styles.optionLabel}>{option.label}</Text>
                                        <Text style={styles.optionDescription} numberOfLines={1}>
                                            {option.description}
                                        </Text>
                                    </View>
                                    <LucideIcons.ChevronRight size={16} color={Colors.separatorOpaque} />
                                </Pressable>
                            );
                        })}
                    </View>
                    
                    <Pressable 
                      onPress={onClose}
                      style={({ pressed }) => [
                        styles.cancelBtn,
                        pressed && { opacity: 0.7 }
                      ]}
                    >
                        <Text style={styles.cancelText}>Dismiss</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    },
    handle: {
        width: 38,
        height: 5,
        backgroundColor: '#E5E5EA',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 24,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#000',
        letterSpacing: -0.5,
        fontFamily: Typography.family.extraBold,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textTertiary,
        marginTop: 4,
        fontFamily: Typography.family.regular,
    },
    optionsList: {
        backgroundColor: '#F9F9FB',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.separator,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
        fontFamily: Typography.family.bold,
    },
    optionDescription: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginTop: 1,
        fontFamily: Typography.family.regular,
    },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
        fontFamily: Typography.family.semiBold,
    },
});
