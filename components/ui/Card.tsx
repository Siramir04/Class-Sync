import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useResponsive } from '../../hooks/useResponsive';
import { Spacing } from '../../constants/spacing';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    noPadding?: boolean;
    variant?: 'elevated' | 'filled' | 'outlined';
    elevation?: 1 | 2 | 3;
}

/**
 * Card — Teal design system
 * 16px radius, borderSubtle, shadowCard, web hover translateY(-2px)
 */
export default function Card({
    children,
    style,
    noPadding,
    variant = 'elevated',
    elevation = 1
}: CardProps) {
    const { colors: Colors, isDark } = useTheme();
    const { isDesktop } = useResponsive();
    const isDesktopWeb = Platform.OS === 'web' && isDesktop;

    const getVariantStyle = (): ViewStyle => {
        switch (variant) {
            case 'elevated':
                return {
                    backgroundColor: Colors.surface,
                    borderWidth: 1,
                    borderColor: Colors.borderSubtle,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: isDesktopWeb ? 4 : 2 },
                    shadowOpacity: isDark ? 0.3 : 0.05,
                    shadowRadius: isDesktopWeb ? 6 : 3,
                    elevation: elevation * 2,
                };
            case 'filled':
                return {
                    backgroundColor: Colors.surfaceVariant,
                    elevation: 0,
                };
            case 'outlined':
                return {
                    backgroundColor: Colors.surface,
                    borderWidth: 1,
                    borderColor: Colors.borderSubtle,
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
        borderRadius: Spacing.cardRadius,
        overflow: 'hidden',
    },
    padding: {
        padding: Spacing.md,
    },
});
