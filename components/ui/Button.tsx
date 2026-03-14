import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
    fullWidth = true,
}: ButtonProps) {
    const buttonStyles = [
        styles.base,
        styles[variant],
        !fullWidth && styles.wrap,
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        variant === 'secondary' || variant === 'ghost' ? styles.secondaryText : styles.primaryText,
        variant === 'danger' && styles.dangerText,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' || variant === 'danger' ? Colors.white : Colors.primaryBlue}
                />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        height: 54, // iOS standard large button height
        borderRadius: Spacing.buttonRadius,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        width: '100%',
    },
    wrap: {
        width: undefined,
        alignSelf: 'flex-start',
    },
    primary: {
        backgroundColor: Colors.primaryBlue,
    },
    secondary: {
        backgroundColor: Colors.subtleFill,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: Colors.error,
    },
    disabled: {
        opacity: 0.4,
    },
    text: {
        ...Typography.buttonText,
        fontWeight: '600',
    },
    primaryText: {
        color: Colors.white,
    },
    secondaryText: {
        color: Colors.primaryBlue,
    },
    dangerText: {
        color: Colors.white,
    },
});
