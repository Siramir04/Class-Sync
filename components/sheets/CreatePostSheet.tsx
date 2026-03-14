import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { PostType } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import CustomDateTimePicker from '../ui/DateTimePicker';
import { Ionicons } from '@expo/vector-icons';

interface CreatePostSheetProps {
    visible: boolean;
    onClose: () => void;
    postType: PostType;
    courseCode: string;
    onSubmit: (data: CreatePostData) => void;
    loading?: boolean;
}

export interface CreatePostData {
    title: string;
    description: string;
    venue?: string;
    lectureDate?: Date;
    startTime?: string;
    endTime?: string;
    dueDate?: Date;
    marks?: string;
    topics?: string;
    isImportant?: boolean;
}

const typeLabels: Record<PostType, string> = {
    lecture: 'Lecture',
    assignment: 'Assignment',
    test: 'Test',
    note: 'Note',
    announcement: 'Announcement',
    cancellation: 'Cancellation',
    attendance: 'Attendance',
};

const typeIcons: Record<PostType, string> = {
    lecture: 'book',
    assignment: 'document-text',
    test: 'clipboard',
    note: 'bookmark',
    announcement: 'megaphone',
    cancellation: 'close-circle',
    attendance: 'qr-code',
};

export default function CreatePostSheet({
    visible,
    onClose,
    postType,
    courseCode,
    onSubmit,
    loading = false,
}: CreatePostSheetProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [venue, setVenue] = useState('');
    const [lectureDate, setLectureDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [dueDate, setDueDate] = useState(new Date());
    const [marks, setMarks] = useState('');
    const [topics, setTopics] = useState('');
    const [isImportant, setIsImportant] = useState(false);

    const handleSubmit = () => {
        onSubmit({
            title,
            description,
            venue,
            lectureDate: postType === 'lecture' || postType === 'test' ? lectureDate : undefined,
            startTime: postType === 'lecture' || postType === 'test' ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            endTime: postType === 'lecture' || postType === 'test' ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            dueDate: postType === 'assignment' ? dueDate : undefined,
            marks,
            topics,
            isImportant: (postType === 'announcement' || postType === 'test' || postType === 'assignment') ? isImportant : false,
        });
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setVenue('');
        setLectureDate(new Date());
        setStartTime(new Date());
        setEndTime(new Date());
        setDueDate(new Date());
        setMarks('');
        setTopics('');
        setIsImportant(false);
    };

    const showDateTimeFields = postType === 'lecture' || postType === 'test';
    const showDueDateField = postType === 'assignment';
    const showVenueField = postType === 'lecture' || postType === 'test';
    const showMarksField = postType === 'assignment' || postType === 'test';
    const showTopicsField = postType === 'test';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardSpacer}
                >
                    <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.handle} />
                        
                        <View style={styles.header}>
                            <View style={[styles.iconBox, { backgroundColor: Colors.primaryBlue + '10' }]}>
                                <Ionicons name={typeIcons[postType] as any} size={24} color={Colors.primaryBlue} />
                            </View>
                            <View style={styles.headerText}>
                                <Text style={styles.title}>New {typeLabels[postType]}</Text>
                                <Text style={styles.subtitle}>{courseCode}</Text>
                            </View>
                            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                                <Ionicons name="close-circle" size={28} color={Colors.border} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            showsVerticalScrollIndicator={false} 
                            style={styles.form}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Input
                                label="TITLE"
                                value={title}
                                onChangeText={setTitle}
                                placeholder={`e.g. ${postType === 'lecture' ? 'Intro to Algorithms' : 'Week 1 Update'}`}
                                containerStyle={styles.inputContainer}
                            />
                            <Input
                                label="DESCRIPTION"
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Add more context or instructions..."
                                multiline
                                numberOfLines={4}
                                style={styles.textArea}
                                containerStyle={styles.inputContainer}
                            />

                            {showDateTimeFields && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>SCHEDULE</Text>
                                    <CustomDateTimePicker
                                        label="DATE"
                                        value={lectureDate}
                                        mode="date"
                                        onChange={setLectureDate}
                                    />
                                    <View style={styles.timeRow}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <CustomDateTimePicker
                                                label="START TIME"
                                                value={startTime}
                                                mode="time"
                                                onChange={setStartTime}
                                            />
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <CustomDateTimePicker
                                                label="END TIME"
                                                value={endTime}
                                                mode="time"
                                                onChange={setEndTime}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}

                            {showVenueField && (
                                <Input
                                    label="VENUE"
                                    value={venue}
                                    onChangeText={setVenue}
                                    placeholder="e.g. LT 1, Engineering Block"
                                    containerStyle={styles.inputContainer}
                                />
                            )}

                            {showDueDateField && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>DEADLINE</Text>
                                    <CustomDateTimePicker
                                        label="DUE DATE"
                                        value={dueDate}
                                        mode="date"
                                        onChange={setDueDate}
                                    />
                                </View>
                            )}

                            <View style={styles.row}>
                                {showMarksField && (
                                    <View style={{ flex: 1, marginRight: showTopicsField ? 8 : 0 }}>
                                        <Input
                                            label="MARKS"
                                            value={marks}
                                            onChangeText={setMarks}
                                            placeholder="100"
                                            keyboardType="numeric"
                                            containerStyle={styles.inputContainer}
                                        />
                                    </View>
                                )}
                                {showTopicsField && (
                                    <View style={{ flex: 2, marginLeft: 8 }}>
                                        <Input
                                            label="TOPICS"
                                            value={topics}
                                            onChangeText={setTopics}
                                            placeholder="e.g. Unit 1 & 2"
                                            containerStyle={styles.inputContainer}
                                        />
                                    </View>
                                )}
                            </View>

                            {(postType === 'announcement' || postType === 'test' || postType === 'assignment') && (
                                <TouchableOpacity 
                                    style={styles.importantToggle} 
                                    onPress={() => setIsImportant(!isImportant)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.importantToggleText}>
                                        <Text style={styles.importantToggleTitle}>Mark as Important</Text>
                                        <Text style={styles.importantToggleSubtitle}>High priority notification & read receipts</Text>
                                    </View>
                                    <View style={[styles.switch, isImportant && styles.switchActive]}>
                                        <View style={[styles.switchHandle, isImportant && styles.switchHandleActive]} />
                                    </View>
                                </TouchableOpacity>
                            )}

                            <Button
                                title={`Share ${typeLabels[postType]}`}
                                onPress={handleSubmit}
                                loading={loading}
                                disabled={!title.trim()}
                                style={styles.submitBtn}
                            />
                            
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </Pressable>
                </KeyboardAvoidingView>
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
    keyboardSpacer: {
        width: '100%',
    },
    sheet: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        maxHeight: '90%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 20,
            },
        }),
    },
    handle: {
        width: 36,
        height: 5,
        backgroundColor: Colors.border + '60',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPadding,
        marginBottom: 20,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: 'DMSans_700Bold',
        color: Colors.primaryBlue,
        marginTop: 2,
    },
    closeBtn: {
        padding: 4,
    },
    form: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.screenPadding,
    },
    inputContainer: {
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 11,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textTertiary,
        letterSpacing: 1.2,
        marginBottom: 12,
        marginLeft: 4,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
    },
    submitBtn: {
        height: 56,
        borderRadius: 16,
        marginTop: 12,
        marginBottom: 20,
    },
    importantToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border + '15',
        marginBottom: 20,
    },
    importantToggleText: {
        flex: 1,
    },
    importantToggleTitle: {
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
    },
    importantToggleSubtitle: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textTertiary,
        marginTop: 2,
    },
    switch: {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.border + '30',
        padding: 2,
    },
    switchActive: {
        backgroundColor: Colors.accentBlue,
    },
    switchHandle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.white,
    },
    switchHandleActive: {
        transform: [{ translateX: 20 }],
    },
});
