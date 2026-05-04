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
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/spacing';

interface Props {
    label: string;
    value: Date;
    onChange: (date: Date) => void;
    mode: 'date' | 'time';
}

export default function CustomDateTimePicker({ label, value, onChange, mode }: Props) {
    const { colors: Colors, typography: Typography } = useTheme();
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
                        <View style={[styles.iosPickerContainer, { backgroundColor: Colors.surface }]}>
                            <View style={[styles.iosPickerHeader, { borderBottomColor: Colors.separator }]}>
                                <TouchableOpacity onPress={() => setShow(false)}>
                                    <Text style={[styles.doneText, { color: Colors.accentBlue }]}>Done</Text>
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
            <Text style={[styles.label, { color: Colors.textSecondary }]}>{label}</Text>
            <TouchableOpacity
                style={[
                    styles.inputContainer, 
                    { 
                        backgroundColor: Colors.surfaceSecondary,
                        borderColor: Colors.border
                    }
                ]}
                onPress={() => setShow(true)}
                activeOpacity={0.7}
            >
                <Text style={[styles.valueText, { color: Colors.textPrimary, ...Typography.body }]}>
                    {formatDate(value)}
                </Text>
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
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputContainer: {
        height: 50,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderWidth: 1,
    },
    valueText: {
        fontSize: 16,
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
        paddingBottom: 40,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderBottomWidth: 1,
    },
    doneText: {
        fontWeight: '600',
        fontSize: 17,
    },
});
