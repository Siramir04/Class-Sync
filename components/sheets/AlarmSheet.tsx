import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Platform, ScrollView, Alert, Dimensions } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { format, subMinutes } from 'date-fns';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';
import { Post } from '../../types';
import { useAlarmStore } from '../../store/alarmStore';
import * as alarmService from '../../services/alarmService';
import Button from '../ui/Button';

const { height } = Dimensions.get('window');

interface AlarmSheetProps {
    visible: boolean;
    onClose: () => void;
    post: Post;
}

const LEAD_TIME_OPTIONS = [
    { label: '60 minutes before', value: 60 },
    { label: '45 minutes before', value: 45 },
    { label: '30 minutes before', value: 30 },
    { label: '15 minutes before', value: 15 },
];

export default function AlarmSheet({ visible, onClose, post }: AlarmSheetProps) {
    const [leadMinutes, setLeadMinutes] = useState(30);
    const [loading, setLoading] = useState(false);
    const { setAlarm, removeAlarm, isAlarmSet, alarms } = useAlarmStore();
    
    const isSet = isAlarmSet(post.id);
    const eventId = alarms[post.id];

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
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.sheet}>
                    <View style={styles.handle} />
                    
                    <View style={styles.header}>
                        <Text style={styles.title}>Set lecture alarm</Text>
                        <Text style={styles.subtitle}>Choose how early to be notified</Text>
                    </View>

                    {isSet ? (
                        <View style={styles.statusSection}>
                             <View style={styles.infoRow}>
                               <LucideIcons.CheckCircle2 size={24} color={Colors.accentBlue} />
                               <View style={styles.infoText}>
                                 <Text style={styles.statusTitle}>Alarm is active</Text>
                                 <Text style={styles.statusSubtitle}>You'll be notified before class starts.</Text>
                               </View>
                             </View>
                             <Button 
                               title="Remove Alarm"
                               variant="ghost"
                               onPress={handleRemoveAlarm}
                               loading={loading}
                               style={{ marginTop: 10 }}
                               textStyle={{ color: Colors.error }}
                             />
                        </View>
                    ) : (
                        <View style={styles.optionsList}>
                            {LEAD_TIME_OPTIONS.map((option) => {
                                const isSelected = leadMinutes === option.value;
                                return (
                                    <Pressable 
                                        key={option.value}
                                        onPress={() => setLeadMinutes(option.value)}
                                        style={styles.optionRow}
                                    >
                                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                                            {option.label}
                                        </Text>
                                        {isSelected && (
                                            <LucideIcons.Check size={20} color={Colors.accentBlue} strokeWidth={3} />
                                        )}
                                    </Pressable>
                                );
                            })}
                            
                            <Button 
                                title="Set Alarm"
                                onPress={handleSetAlarm}
                                loading={loading}
                                style={styles.submitButton}
                            />
                        </View>
                    )}
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
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 20,
            }
        })
    },
    handle: {
        width: 38,
        height: 5,
        backgroundColor: '#E5E5EA',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 24,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#000',
        letterSpacing: -0.5,
        fontFamily: Typography.family.extraBold,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textTertiary,
        marginTop: 4,
        fontFamily: Typography.family.regular,
    },
    statusSection: {
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(0,122,255,0.05)',
        borderRadius: 16,
    },
    infoText: {
        marginLeft: 12,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        fontFamily: Typography.family.bold,
    },
    statusSubtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 1,
        fontFamily: Typography.family.regular,
    },
    optionsList: {
        gap: 2,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.separator,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.textSecondary,
        fontFamily: Typography.family.medium,
    },
    optionLabelSelected: {
        color: '#000',
        fontWeight: '700',
    },
    submitButton: {
        marginTop: 24,
    }
});
