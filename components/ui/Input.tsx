import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
  Platform
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
    containerStyle?: ViewStyle;
}

/**
 * Material 3 (M3) Outlined Text Field
 * Features a smooth floating label animation and distinct focus indicator.
 */
export default function Input({
    label,
    error,
    containerStyle,
    onFocus,
    onBlur,
    value,
    ...rest
}: InputProps) {
    const [isFocused, setIsFocused] = React.useState(false);

    // Animation refs for the floating label
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
            outputRange: ['transparent', Colors.background],
        }),
        color: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: error ? Colors.error : [Colors.onSurfaceVariant, Colors.primary],
        }),
        paddingHorizontal: labelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 4],
        }),
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: error ? [Colors.error, Colors.error] : [Colors.outline, Colors.primary],
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
                    style={[styles.floatingLabel, labelStyle]}
                >
                    {label}
                </Animated.Text>

                <TextInput
                    style={[
                        styles.input,
                        rest.multiline && { paddingTop: 16, textAlignVertical: 'top' }
                    ]}
                    placeholderTextColor="transparent" // Placeholder is handled by floating label
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
                    <Text style={styles.error}>{error}</Text>
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
        borderRadius: 4, // M3 Outlined standard uses small radius
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    floatingLabel: {
        position: 'absolute',
        left: 12,
        zIndex: 10,
        fontFamily: Typography.family.medium,
    },
    input: {
        fontSize: 16,
        color: Colors.onSurface,
        fontFamily: Typography.family.regular,
        ...Platform.select({
            web: { outlineStyle: 'none' },
        }),
    },
    errorWrapper: {
        marginTop: 4,
        paddingHorizontal: 12,
    },
    error: {
        ...Typography.m3.labelSmall,
        color: Colors.error,
    },
});
