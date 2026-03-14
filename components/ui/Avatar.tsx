import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface AvatarProps {
    name: string;
    size?: number;
    style?: ViewStyle;
    backgroundColor?: string;
}

export default function Avatar({
    name,
    size = 36,
    style,
    backgroundColor = Colors.primaryBlue,
}: AvatarProps) {
    const initials = name
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor,
                },
                style,
            ]}
        >
            <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    text: {
        color: Colors.white,
        fontFamily: 'DMSans_700Bold',
        letterSpacing: -0.5,
    },
});
