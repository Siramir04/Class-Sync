import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    noPadding?: boolean;
}

export default function Card({ children, style, noPadding }: CardProps) {
    return (
        <View style={[styles.card, !noPadding && styles.padding, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Spacing.cardRadius,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    padding: {
        padding: Spacing.md,
    },
});
