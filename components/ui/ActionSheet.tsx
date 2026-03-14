import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Platform,
    Dimensions,
} from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ActionSheetProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function ActionSheet({ visible, onClose, title, children }: ActionSheetProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    
                    {title && (
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            <Pressable onPress={onClose} style={styles.closeBtn}>
                                <LucideIcons.X size={20} color={Colors.textTertiary} />
                            </Pressable>
                        </View>
                    )}
                    
                    {children}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 44 : 32,
        maxHeight: SCREEN_HEIGHT * 0.85,
    },
    handle: {
        width: 38,
        height: 5,
        backgroundColor: '#E5E5EA',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.separator,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
        fontFamily: Typography.family.extraBold,
    },
    closeBtn: {
        width: 32,
        height: 32,
        backgroundColor: '#F2F2F7',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
