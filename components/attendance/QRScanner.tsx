import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface QRScannerProps {
    onScan: (data: string) => void;
    isActive: boolean;
}

export default function QRScanner({ onScan, isActive }: QRScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (isActive) {
            setScanned(false);
        }
    }, [isActive]);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
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
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.unfocusedContainer} />
                    <View style={styles.focusedRow}>
                        <View style={styles.unfocusedContainer} />
                        <View style={styles.focusedContainer}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                        <View style={styles.unfocusedContainer} />
                    </View>
                    <View style={styles.unfocusedContainer}>
                        <Text style={styles.instructionText}>
                            Point your camera at the QR code displayed by your lecturer
                        </Text>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
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
        backgroundColor: Colors.primaryBlue,
        padding: 16,
        borderRadius: 8,
        marginHorizontal: 40,
        alignItems: 'center',
    },
    buttonText: {
        ...Typography.buttonText,
        color: 'white',
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
        borderColor: Colors.primaryBlue,
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
        ...Typography.label,
        color: 'white',
        marginTop: 20,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
