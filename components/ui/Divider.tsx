import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/spacing';

interface DividerProps {
    style?: ViewStyle;
}

export default function Divider({ style }: DividerProps) {
    const { colors: Colors } = useTheme();
    return <View style={[styles.divider, { backgroundColor: Colors.border }, style]} />;
}

const styles = StyleSheet.create({
    divider: {
        height: 1,
        marginVertical: Spacing.md,
    },
});
