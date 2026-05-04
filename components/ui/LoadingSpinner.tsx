import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({
    size = 'large',
    color,
    fullScreen = false,
}: LoadingSpinnerProps) {
    const { colors: Colors } = useTheme();
    const spinnerColor = color || Colors.primary;

    return (
        <View style={[styles.container, fullScreen && styles.fullScreen, fullScreen && { backgroundColor: Colors.surface }]}>
            <ActivityIndicator size={size} color={spinnerColor} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    fullScreen: {
        flex: 1,
    },
});
