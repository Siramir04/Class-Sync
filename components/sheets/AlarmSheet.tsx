import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Platform, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, subMinutes } from 'date-fns';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Post } from '../../types';
import { useAlarmStore } from '../../store/alarmStore';
import * as alarmService from '../../services/alarmService';
import Button from '../ui/Button';

interface AlarmSheetProps {
    visible: boolean;
    onClose: () => void;
    post: Post;
}

const LEAD_TIME_OPTIONS = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
];

export default function AlarmSheet({ visible, onClose, post }: AlarmSheetProps) {
    const [leadMinutes, setLeadMinutes] = useState(30);
    const [loading, setLoading] = useState(false);
    const { setAlarm, removeAlarm, isAlarmSet, alarms } = useAlarmStore();
    
    const isSet = isAlarmSet(post.id);
    const eventId = alarms[post.id];

    // Calculate alarm time for display
    const getAlarmTime = () => {
        if (!post.lectureDate || !post.startTime) return '';
        
        const timeRegex = /(\d{1,2}):(\d{2})\s?(AM|PM)/i;
        const match = post.startTime.match(timeRegex);
        if (!match) return '';

        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const ampm = match[3].toUpperCase();

        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        const lectureDateTime = new Date(post.lectureDate);
        lectureDateTime.setHours(hours, minutes, 0, 0);

        const alarmTime = subMinutes(lectureDateTime, isSet ? 30 : leadMinutes); // Simplified for display if already set
        return format(alarmTime, 'h:mm a');
    };

    const handleSetAlarm = async () => {
        setLoading(true);
        try {
            const id = await alarmService.setClassAlarm({
                postId: post.id,
                courseCode: post.courseCode,
                venueName: post.venue || 'TBA',
                lectureDate: post.lectureDate!,
                startTime: post.startTime!,
                leadMinutes,
            });
            setAlarm(post.id, id);
            Alert.alert('Success', `Alarm set for ${getAlarmTime()}`);
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to set alarm');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAlarm = async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            await alarmService.removeClassAlarm(eventId);
            removeAlarm(post.id);
            Alert.alert('Removed', 'Class alarm has been removed');
            onClose();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to remove alarm');
        } finally {
            setLoading(false);
        }
    };

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
                    
                    <View style={styles.header}>
                        <Text style={styles.title}>Set Class Alarm</Text>
                        <Text style={styles.subtitle}>
                            {post.courseCode} — {post.lectureDate ? format(post.lectureDate, 'MMM d') : ''} at {post.startTime}
                        </Text>
                    </View>

                    {isSet ? (
                        <View style={styles.statusContainer}>
                            <View style={styles.successRow}>
                                <View style={styles.checkIcon}>
                                    <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                                </View>
                                <Text style={styles.statusText}>Alarm set for this lecture</Text>
                            </View>
                            <Button 
                                title="Remove Alarm" 
                                variant="ghost" 
                                onPress={handleRemoveAlarm}
                                loading={loading}
                                textStyle={{ color: Colors.error }}
                            />
                        </View>
                    ) : (
                        <View style={styles.content}>
                            <Text style={styles.label}>Lead time</Text>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.pillContainer}
                            >
                                {LEAD_TIME_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.pill,
                                            leadMinutes === option.value && styles.pillSelected
                                        ]}
                                        onPress={() => setLeadMinutes(option.value)}
                                    >
                                        <Text style={[
                                            styles.pillText,
                                            leadMinutes === option.value && styles.pillTextSelected
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Button 
                                title="Set Alarm" 
                                onPress={handleSetAlarm}
                                loading={loading}
                                style={styles.mainButton}
                            />
                        </View>
                    )}
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingHorizontal: Spacing.screenPadding,
    },
    handle: {
        width: 36,
        height: 5,
        backgroundColor: Colors.border + '60',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
    },
    content: {
        gap: 16,
    },
    label: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    pillContainer: {
        gap: 8,
        paddingBottom: 8,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.subtleFill,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    pillSelected: {
        backgroundColor: Colors.accentBlue,
    },
    pillText: {
        fontSize: 14,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textSecondary,
    },
    pillTextSelected: {
        color: Colors.white,
    },
    mainButton: {
        marginTop: 8,
    },
    statusContainer: {
        alignItems: 'center',
        gap: 20,
    },
    successRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.success + '10',
        padding: 16,
        borderRadius: 12,
        width: '100%',
    },
    checkIcon: {
        marginRight: 12,
    },
    statusText: {
        fontSize: 16,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
    },
});
