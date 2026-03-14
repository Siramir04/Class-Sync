import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';

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
                    error && styles.inputError,
                    rest.multiline && { height: 100, paddingTop: 12, paddingBottom: 12 }
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
        marginBottom: 20,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textTertiary,
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontFamily: Typography.family.bold,
    },
    input: {
        height: 52,
        backgroundColor: '#F9F9FB',
        borderWidth: 1,
        borderColor: Colors.separator,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#000',
        fontFamily: Typography.family.medium,
    },
    inputFocused: {
        borderColor: Colors.accentBlue,
        backgroundColor: 'white',
    },
    inputError: {
        borderColor: Colors.error,
    },
    error: {
        fontSize: 12,
        color: Colors.error,
        marginTop: 6,
        marginLeft: 4,
        fontFamily: Typography.family.regular,
    },
});
