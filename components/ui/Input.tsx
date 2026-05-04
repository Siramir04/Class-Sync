import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

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
    value,
    ...rest
}: InputProps) {
    const { colors: Colors, typography: Typography } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
    const focusAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(labelAnim, {
                toValue: (isFocused || value) ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(focusAnim, {
                toValue: isFocused ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            })
        ]).start();
    }, [isFocused, value]);

    const labelStyle = {
        top: labelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [16, -10],
        }),
        fontSize: labelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [15, 12],
        }),
        backgroundColor: labelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['transparent', Colors.surface],
        }),
        color: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: error ? [Colors.error, Colors.error] : [Colors.textSecondary, Colors.primary],
        }),
        paddingHorizontal: labelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 4],
        }),
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: error ? [Colors.error, Colors.error] : [Colors.border, Colors.primary],
    });

    const borderWidth = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2],
    });

    return (
        <View style={[styles.container, containerStyle]}>
            <Animated.View
                style={[
                    styles.inputWrapper,
                    {
                        borderColor,
                        borderWidth,
                        height: rest.multiline ? 120 : 56,
                    }
                ]}
            >
                <Animated.Text
                    pointerEvents="none"
                    style={[
                        styles.floatingLabel, 
                        labelStyle,
                        { fontFamily: Typography.family.medium }
                    ]}
                >
                    {label}
                </Animated.Text>

                <TextInput
                    style={[
                        styles.input,
                        { 
                            color: Colors.textPrimary,
                            fontFamily: Typography.family.regular
                        },
                        rest.multiline && { paddingTop: 16, textAlignVertical: 'top' }
                    ]}
                    placeholderTextColor="transparent"
                    onFocus={(e) => {
                        setIsFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    value={value}
                    {...rest}
                />
            </Animated.View>

            {error ? (
                <View style={styles.errorWrapper}>
                    <Text style={[styles.error, { color: Colors.error, ...Typography.m3.labelSmall }]}>{error}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    inputWrapper: {
        borderRadius: 4,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    floatingLabel: {
        position: 'absolute',
        left: 12,
        zIndex: 10,
    },
    input: {
        fontSize: 16,
    },
    errorWrapper: {
        marginTop: 4,
        paddingHorizontal: 12,
    },
    error: {
        fontWeight: '500',
    },
});
