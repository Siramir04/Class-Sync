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
    ...rest
}: InputProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholderTextColor={Colors.textSecondary}
                {...rest}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        ...Typography.label,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    input: {
        height: Spacing.inputHeight,
        backgroundColor: Colors.subtleFill,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Spacing.buttonRadius,
        paddingHorizontal: Spacing.md,
        ...Typography.body,
        color: Colors.textPrimary,
    },
    inputError: {
        borderColor: Colors.error,
    },
    error: {
        ...Typography.label,
        color: Colors.error,
        marginTop: Spacing.xs,
    },
});
