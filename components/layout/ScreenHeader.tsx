import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
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
    const { colors: Colors } = useTheme();
    const themedStyles = styles(Colors);
    return (
        <View style={themedStyles.header}>
            {showBack ? (
                <TouchableOpacity onPress={onBack} style={themedStyles.backButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
            ) : (
                <View style={themedStyles.placeholder} />
            )}
            <Text style={themedStyles.title} numberOfLines={1}>{title}</Text>
            {rightAction ? rightAction : <View style={themedStyles.placeholder} />}
        </View>
    );
}

const styles = (Colors: any) => StyleSheet.create({
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
        ...Typography.title3,
        color: Colors.textPrimary,
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
});
