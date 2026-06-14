import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Platform, Dimensions } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
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

const getOptions = (Colors: any): PostTypeOption[] => [
    { type: 'lecture', label: 'Schedule Lecture', icon: 'BookOpen', color: Colors.primary, description: 'Fix a time and venue for a new lecture' },
    { type: 'assignment', label: 'Post Assignment', icon: 'FileText', color: Colors.warning, description: 'Share coursework with a due date' },
    { type: 'attendance', label: 'Start Attendance', icon: 'QrCode', color: Colors.success, description: 'Real-time proximity tracking' },
    { type: 'test', label: 'Schedule Test', icon: 'ClipboardCheck', color: Colors.error, description: 'Announce an upcoming quiz or exam' },
    { type: 'announcement', label: 'Announcement', icon: 'Megaphone', color: Colors.primary, description: 'Broadcast important class information' },
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
    const { colors: Colors } = useTheme();
    const themedStyles = styles(Colors);
    const allOptions = getOptions(Colors);
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
            <View style={themedStyles.overlay}>
                <Pressable style={themedStyles.backdrop} onPress={onClose} />
                <View style={themedStyles.sheet}>
                    <View style={themedStyles.handle} />
                    <View style={themedStyles.header}>
                        <Text style={themedStyles.title}>What's happening?</Text>
                        <Text style={themedStyles.subtitle}>Select the type of update to share</Text>
                    </View>
                    
                    <View style={themedStyles.optionsList}>
                        {options.map((option, index) => {
                            const IconComponent = LucideIcons[option.icon] as any;
                            return (
                                <Pressable
                                    key={option.type}
                                    style={({ pressed }) => [
                                        themedStyles.option,
                                        pressed && { backgroundColor: Colors.surfaceSecondary }
                                    ]}
                                    onPress={() => {
                                        onSelect(option.type);
                                        onClose();
                                    }}
                                >
                                    <View style={[themedStyles.iconBox, { backgroundColor: option.color + '10' }]}>
                                        <IconComponent
                                            size={20}
                                            color={option.color}
                                        />
                                    </View>
                                    <View style={themedStyles.optionContent}>
                                        <Text style={themedStyles.optionLabel}>{option.label}</Text>
                                        <Text style={themedStyles.optionDescription} numberOfLines={1}>
                                            {option.description}
                                        </Text>
                                    </View>
                                    <LucideIcons.ChevronRight size={16} color={Colors.textTertiary} />
                                </Pressable>
                            );
                        })}
                    </View>
                    
                    <Pressable 
                      onPress={onClose}
                      style={({ pressed }) => [
                        themedStyles.cancelBtn,
                        pressed && { opacity: 0.7 }
                      ]}
                    >
                        <Text style={themedStyles.cancelText}>Dismiss</Text>
                    </Pressable>
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
    },
    handle: {
        width: 38,
        height: 5,
        backgroundColor: Colors.separator,
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
        color: Colors.textPrimary,
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
        backgroundColor: Colors.surfaceSecondary,
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
        color: Colors.textPrimary,
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
