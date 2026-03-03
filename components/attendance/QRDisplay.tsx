import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../../constants/colors';

interface QRDisplayProps {
    value: string;
    size?: number;
}

export default function QRDisplay({ value, size = 240 }: QRDisplayProps) {
    if (!value) return null;

    return (
        <View style={styles.container}>
            <QRCode
                value={value}
                size={size}
                color={Colors.primaryBlue}
                backgroundColor="white"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        // Subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});
