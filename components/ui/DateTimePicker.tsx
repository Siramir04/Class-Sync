import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

interface Props {
    label: string;
    value: Date;
    onChange: (date: Date) => void;
    mode: 'date' | 'time';
}

export default function CustomDateTimePicker({ label, value, onChange, mode }: Props) {
    const [show, setShow] = useState(false);

    const onPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }
        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    const formatDate = (date: Date) => {
        if (mode === 'date') {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
            });
        } else {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        }
    };

    const renderPicker = () => {
        if (Platform.OS === 'ios') {
            return (
                <Modal visible={show} transparent animationType="slide">
                    <View style={styles.iosModalContainer}>
                        <TouchableOpacity 
                            style={styles.iosModalOverlay} 
                            onPress={() => setShow(false)} 
                        />
                        <View style={styles.iosPickerContainer}>
                            <View style={styles.iosPickerHeader}>
                                <TouchableOpacity onPress={() => setShow(false)}>
                                    <Text style={styles.doneText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={value}
                                mode={mode}
                                display="spinner"
                                onChange={onPickerChange}
                                textColor={Colors.textPrimary}
                            />
                        </View>
                    </View>
                </Modal>
            );
        }

        if (show && Platform.OS === 'android') {
            return (
                <DateTimePicker
                    value={value}
                    mode={mode}
                    display="default"
                    onChange={onPickerChange}
                />
            );
        }

        return null;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShow(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.valueText}>{formatDate(value)}</Text>
                <Ionicons
                    name={mode === 'date' ? 'calendar-outline' : 'time-outline'}
                    size={20}
                    color={Colors.textSecondary}
                />
            </TouchableOpacity>
            {renderPicker()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    inputContainer: {
        height: Spacing.inputHeight,
        backgroundColor: Colors.subtleFill,
        borderRadius: Spacing.inputRadius,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    valueText: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    // iOS Modal Styles
    iosModalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    iosModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    iosPickerContainer: {
        backgroundColor: Colors.surface,
        paddingBottom: 40,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    doneText: {
        color: Colors.accentBlue,
        fontWeight: '600',
        fontSize: 17,
    },
});
