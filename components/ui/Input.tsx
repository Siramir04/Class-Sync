import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export default function Input({
    label,
    error,
    containerStyle,
    onFocus,
    onBlur,
    ...rest
}: InputProps) {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[
                    styles.input, 
                    isFocused && styles.inputFocused,
                    error && styles.inputError
                ]}
                placeholderTextColor={Colors.textTertiary}
                onFocus={(e) => {
                    setIsFocused(true);
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    onBlur?.(e);
                }}
                {...rest}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.lg,
    },
    label: {
        ...Typography.bodySmall,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: Spacing.inputHeight,
        backgroundColor: Colors.surface,
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderRadius: Spacing.inputRadius,
        paddingHorizontal: Spacing.md,
        ...Typography.body,
        color: Colors.textPrimary,
    },
    inputFocused: {
        borderColor: Colors.primaryBlue,
    },
    inputError: {
        borderColor: Colors.error,
    },
    error: {
        ...Typography.bodySmall,
        color: Colors.error,
        marginTop: 6,
        marginLeft: 4,
    },
});
