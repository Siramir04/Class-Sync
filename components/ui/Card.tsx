import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    noPadding?: boolean;
    variant?: 'elevated' | 'filled' | 'outlined';
    elevation?: 1 | 2 | 3;
}

/**
 * Material 3 (M3) Card Component
 * Uses Tonal Elevation (color tints) instead of drop shadows where possible.
 */
export default function Card({
    children,
    style,
    noPadding,
    variant = 'elevated',
    elevation = 1
}: CardProps) {

    const getVariantStyle = () => {
        switch (variant) {
            case 'elevated':
                // M3 Elevated: Tonal background + subtle shadow
                const bg = elevation === 1 ? Colors.surfaceElevation1 :
                           elevation === 2 ? Colors.surfaceElevation2 :
                           Colors.surfaceElevation3;
                return {
                    backgroundColor: bg,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: elevation,
                };
            case 'filled':
                // M3 Filled: Neutral container color
                return {
                    backgroundColor: Colors.surfaceVariant,
                    elevation: 0,
                };
            case 'outlined':
                // M3 Outlined: Transparent + border
                return {
                    backgroundColor: Colors.surface,
                    borderWidth: 1,
                    borderColor: Colors.outlineVariant,
                    elevation: 0,
                };
            default:
                return { backgroundColor: Colors.surface };
        }
    };

    return (
        <View style={[
            styles.card,
            getVariantStyle(),
            !noPadding && styles.padding,
            style
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16, // M3 Large Corner Radius (Standard is 12-16 for medium components)
        overflow: 'hidden',
    },
    padding: {
        padding: 16,
    },
});
