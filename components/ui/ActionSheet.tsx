import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Platform,
    Dimensions,
    Animated,
    Easing,
} from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ActionSheetProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

/**
 * Material 3 (M3) Bottom Sheet
 * Features a large 28dp corner radius, drag handle, and smooth slide-up animation.
 */
export default function ActionSheet({ visible, onClose, title, children }: ActionSheetProps) {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Animate In
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                })
            ]).start();
        } else {
            // Animate Out
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible]);

    if (!visible && slideAnim._value === SCREEN_HEIGHT) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none" // Custom animation handled by Animated
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Backround Scrim */}
                <Animated.View
                    style={[
                        styles.backdrop,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Pressable style={{ flex: 1 }} onPress={onClose} />
                </Animated.View>

                {/* Bottom Sheet Content */}
                <Animated.View
                    style={[
                        styles.sheet,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View style={styles.handle} />
                    
                    {title && (
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            <Pressable
                                onPress={onClose}
                                style={({ pressed }) => [
                                    styles.closeBtn,
                                    pressed && { backgroundColor: Colors.surfaceElevation3 }
                                ]}
                            >
                                <LucideIcons.X size={20} color={Colors.onSurfaceVariant} />
                            </Pressable>
                        </View>
                    )}
                    
                    <View style={styles.content}>
                        {children}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 28, // M3 Extra Large Corners
        borderTopRightRadius: 28,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        maxHeight: SCREEN_HEIGHT * 0.9,
        // Elevation tint
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    handle: {
        width: 32,
        height: 4,
        backgroundColor: Colors.outlineVariant,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
        opacity: 0.4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    title: {
        ...Typography.m3.titleLarge,
        color: Colors.onSurface,
        fontWeight: '700',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 16,
    }
});
