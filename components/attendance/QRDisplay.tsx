import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../hooks/useTheme';

interface QRDisplayProps {
    value: string;
    size?: number;
}

export default function QRDisplay({ value, size = 240 }: QRDisplayProps) {
    const { colors: Colors } = useTheme();
    const themedStyles = styles(Colors);
    if (!value) return null;

    return (
        <View style={themedStyles.container}>
            <QRCode
                value={value}
                size={size}
                color={Colors.primary}
                backgroundColor="#FFFFFF"
            />
        </View>
    );
}

const styles = (Colors: any) => StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#FFFFFF',
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
