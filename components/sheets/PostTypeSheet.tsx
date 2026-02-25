import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
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
    { type: 'lecture', label: 'Schedule Lecture', icon: 'book-outline', color: Colors.accentBlue, description: 'Add a lecture to the schedule' },
    { type: 'assignment', label: 'Post Assignment', icon: 'document-text-outline', color: Colors.warning, description: 'Share an assignment with due date' },
    { type: 'test', label: 'Schedule Test', icon: 'clipboard-outline', color: Colors.error, description: 'Announce an upcoming test' },
    { type: 'note', label: 'Post Note', icon: 'pushpin', color: Colors.success, description: 'Share a class note or reminder' },
    { type: 'announcement', label: 'Announcement', icon: 'megaphone-outline', color: Colors.primaryBlue, description: 'Make an important announcement' },
    { type: 'cancellation', label: 'Cancel Class', icon: 'close-circle-outline', color: Colors.error, description: 'Cancel a scheduled lecture' },
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
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.sheet} onPress={() => { }}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>Create Post</Text>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.type}
                            style={styles.option}
                            onPress={() => {
                                onSelect(option.type);
                                onClose();
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: option.color + '20' }]}>
                                <Ionicons
                                    name={option.icon as keyof typeof Ionicons.glyphMap}
                                    size={22}
                                    color={option.color}
                                />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionLabel}>{option.label}</Text>
                                <Text style={styles.optionDescription}>{option.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.border} />
                        </TouchableOpacity>
                    ))}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: Colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
        marginBottom: Spacing.lg,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '30',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    optionContent: {
        flex: 1,
    },
    optionLabel: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
    },
    optionDescription: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginTop: 2,
    },
});
