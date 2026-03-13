import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    ScrollView,
    Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { PostType } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';

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
    lectureDate?: string;
    startTime?: string;
    endTime?: string;
    dueDate?: string;
    marks?: string;
    topics?: string;
}

const typeLabels: Record<PostType, string> = {
    lecture: 'Schedule Lecture',
    assignment: 'Post Assignment',
    test: 'Schedule Test',
    note: 'Post Note',
    announcement: 'Announcement',
    cancellation: 'Cancel Class',
    attendance: 'Attendance',
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
    const [lectureDate, setLectureDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [marks, setMarks] = useState('');
    const [topics, setTopics] = useState('');

    const handleSubmit = () => {
        onSubmit({
            title,
            description,
            venue,
            lectureDate,
            startTime,
            endTime,
            dueDate,
            marks,
            topics,
        });
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setVenue('');
        setLectureDate('');
        setStartTime('');
        setEndTime('');
        setDueDate('');
        setMarks('');
        setTopics('');
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
                <Pressable style={styles.sheet} onPress={() => { }}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>{typeLabels[postType]}</Text>
                    <Text style={styles.subtitle}>{courseCode}</Text>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
                        <Input
                            label="Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholder={`Enter ${postType} title`}
                        />
                        <Input
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Add details..."
                            multiline
                            numberOfLines={3}
                            style={{ height: 80, textAlignVertical: 'top' }}
                        />
                        {showDateTimeFields && (
                            <>
                                <Input
                                    label="Date"
                                    value={lectureDate}
                                    onChangeText={setLectureDate}
                                    placeholder="e.g. 2025-03-15"
                                />
                                <Input
                                    label="Start Time"
                                    value={startTime}
                                    onChangeText={setStartTime}
                                    placeholder="e.g. 09:00 AM"
                                />
                                <Input
                                    label="End Time"
                                    value={endTime}
                                    onChangeText={setEndTime}
                                    placeholder="e.g. 11:00 AM"
                                />
                            </>
                        )}
                        {showVenueField && (
                            <Input
                                label="Venue"
                                value={venue}
                                onChangeText={setVenue}
                                placeholder="e.g. Hall A"
                            />
                        )}
                        {showDueDateField && (
                            <Input
                                label="Due Date"
                                value={dueDate}
                                onChangeText={setDueDate}
                                placeholder="e.g. 2025-03-20"
                            />
                        )}
                        {showMarksField && (
                            <Input
                                label="Total Marks"
                                value={marks}
                                onChangeText={setMarks}
                                placeholder="e.g. 100"
                                keyboardType="numeric"
                            />
                        )}
                        {showTopicsField && (
                            <Input
                                label="Topics"
                                value={topics}
                                onChangeText={setTopics}
                                placeholder="e.g. Chapter 1-3, Algorithms"
                            />
                        )}

                        <Button
                            title={`Create ${typeLabels[postType]}`}
                            onPress={handleSubmit}
                            loading={loading}
                            disabled={!title.trim()}
                            style={{ marginTop: Spacing.md }}
                        />
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
        maxHeight: '85%',
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: Colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
    },
    subtitle: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
    },
    form: {
        marginTop: Spacing.sm,
    },
});
