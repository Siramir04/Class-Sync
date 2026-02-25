import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

interface ScreenHeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: React.ReactNode;
}

export default function ScreenHeader({
    title,
    showBack = false,
    onBack,
    rightAction,
}: ScreenHeaderProps) {
    return (
        <View style={styles.header}>
            {showBack ? (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
            ) : (
                <View style={styles.placeholder} />
            )}
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {rightAction ? rightAction : <View style={styles.placeholder} />}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.background,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
});
