import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Platform,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

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
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.handle} />
                    
                    {title && (
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    {children}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: SCREEN_HEIGHT * 0.8,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: Colors.border + '60',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPadding,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '10',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    closeBtn: {
        padding: 4,
    },
});
