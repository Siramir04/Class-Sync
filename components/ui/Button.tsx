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
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`${variant}Text` as keyof typeof styles],
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' || variant === 'danger' ? Colors.white : Colors.accentBlue}
                />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        height: Spacing.inputHeight,
        borderRadius: Spacing.buttonRadius,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    fullWidth: {
        width: '100%',
    },
    primary: {
        backgroundColor: Colors.accentBlue,
    },
    secondary: {
        backgroundColor: Colors.subtleFill,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: Colors.error,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        ...Typography.buttonText,
    },
    primaryText: {
        color: Colors.white,
    },
    secondaryText: {
        color: Colors.textPrimary,
    },
    ghostText: {
        color: Colors.accentBlue,
    },
    dangerText: {
        color: Colors.white,
    },
});
