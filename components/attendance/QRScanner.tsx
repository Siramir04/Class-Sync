import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';

interface QRScannerProps {
    onScan: (data: string) => void;
    isActive: boolean;
}

export default function QRScanner({ onScan, isActive }: QRScannerProps) {
    const { colors: Colors } = useTheme();
    const themedStyles = styles(Colors);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (isActive) {
            setScanned(false);
        }
    }, [isActive]);

    if (!permission) {
        return <View style={themedStyles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={themedStyles.container}>
                <Text style={themedStyles.text}>We need your permission to show the camera</Text>
                <TouchableOpacity style={themedStyles.button} onPress={requestPermission}>
                    <Text style={themedStyles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (!scanned && isActive) {
            setScanned(true);
            onScan(data);
        }
    };

    return (
        <View style={themedStyles.container}>
            <CameraView
                style={themedStyles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            >
                <View style={themedStyles.overlay}>
                    <View style={themedStyles.unfocusedContainer} />
                    <View style={themedStyles.focusedRow}>
                        <View style={themedStyles.unfocusedContainer} />
                        <View style={themedStyles.focusedContainer}>
                            <View style={[themedStyles.corner, themedStyles.topLeft]} />
                            <View style={[themedStyles.corner, themedStyles.topRight]} />
                            <View style={[themedStyles.corner, themedStyles.bottomLeft]} />
                            <View style={[themedStyles.corner, themedStyles.bottomRight]} />
                        </View>
                        <View style={themedStyles.unfocusedContainer} />
                    </View>
                    <View style={themedStyles.unfocusedContainer}>
                        <Text style={themedStyles.instructionText}>
                            Point your camera at the QR code displayed by your lecturer
                        </Text>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = (Colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    text: {
        ...Typography.body,
        color: 'white',
        textAlign: 'center',
        padding: 20,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        marginHorizontal: 40,
        alignItems: 'center',
    },
    buttonText: {
        ...Typography.callout,
        color: 'white',
        fontWeight: '600',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusedRow: {
        flexDirection: 'row',
        height: 240,
    },
    focusedContainer: {
        width: 240,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: Colors.primary,
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderBottomWidth: 0,
        borderRightWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderTopWidth: 0,
        borderRightWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
    },
    instructionText: {
        ...Typography.footnote,
        color: 'white',
        marginTop: 20,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
