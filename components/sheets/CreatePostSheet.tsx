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
    StatusBar,
} from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { PostType } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import CustomDateTimePicker from '../ui/DateTimePicker';

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

const typeIcons: Record<PostType, keyof typeof LucideIcons> = {
    lecture: 'BookOpen',
    assignment: 'FileText',
    test: 'ClipboardCheck',
    note: 'Bookmark',
    announcement: 'Megaphone',
    cancellation: 'XCircle',
    attendance: 'QrCode',
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

    const IconComponent = LucideIcons[typeIcons[postType]] as any;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardSpacer}
                >
                    <View style={styles.sheet}>
                        <View style={styles.handle} />
                        
                        <View style={styles.header}>
                           <View style={[styles.iconBox, { backgroundColor: 'rgba(0,122,255,0.08)' }]}>
                               <IconComponent size={24} color={Colors.accentBlue} />
                           </View>
                           <View style={styles.headerTitleBox}>
                             <Text style={styles.title}>New {typeLabels[postType]}</Text>
                             <Text style={styles.subtitle}>{courseCode}</Text>
                           </View>
                           <Pressable onPress={onClose} style={styles.closeBox}>
                             <LucideIcons.X size={20} color={Colors.textTertiary} />
                           </Pressable>
                        </View>

                        <ScrollView 
                            showsVerticalScrollIndicator={false} 
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Input
                                label="Title"
                                value={title}
                                onChangeText={setTitle}
                                placeholder={`e.g. ${postType === 'lecture' ? 'Intro to Algorithms' : 'Week 1 Update'}`}
                            />
                            <Input
                                label="Description"
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Add more context or instructions..."
                                multiline
                                numberOfLines={4}
                            />

                            {showDateTimeFields && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>Schedule</Text>
                                    <View style={styles.inputGroup}>
                                      <CustomDateTimePicker
                                          label="Date"
                                          value={lectureDate}
                                          mode="date"
                                          onChange={setLectureDate}
                                      />
                                      <View style={styles.timeRow}>
                                          <View style={{ flex: 1 }}>
                                              <CustomDateTimePicker
                                                  label="Start"
                                                  value={startTime}
                                                  mode="time"
                                                  onChange={setStartTime}
                                              />
                                          </View>
                                          <View style={{ flex: 1 }}>
                                              <CustomDateTimePicker
                                                  label="End"
                                                  value={endTime}
                                                  mode="time"
                                                  onChange={setEndTime}
                                              />
                                          </View>
                                      </View>
                                    </View>
                                </View>
                            )}

                            {showVenueField && (
                                <Input
                                    label="Venue"
                                    value={venue}
                                    onChangeText={setVenue}
                                    placeholder="e.g. LT 1, Engineering Block"
                                />
                            )}

                            {showDueDateField && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionLabel}>Deadline</Text>
                                    <CustomDateTimePicker
                                        label="Due Date"
                                        value={dueDate}
                                        mode="date"
                                        onChange={setDueDate}
                                    />
                                </View>
                            )}

                            {(showMarksField || showTopicsField) && (
                              <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Assessment Info</Text>
                                <View style={styles.row}>
                                    {showMarksField && (
                                        <View style={{ flex: 1, marginRight: showTopicsField ? 12 : 0 }}>
                                            <Input
                                                label="Marks"
                                                value={marks}
                                                onChangeText={setMarks}
                                                placeholder="100"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    )}
                                    {showTopicsField && (
                                        <View style={{ flex: 2 }}>
                                            <Input
                                                label="Topics"
                                                value={topics}
                                                onChangeText={setTopics}
                                                placeholder="e.g. Unit 1 & 2"
                                            />
                                        </View>
                                    )}
                                </View>
                              </View>
                            )}

                            {(postType === 'announcement' || postType === 'test' || postType === 'assignment') && (
                                <Pressable 
                                    style={styles.toggleRow} 
                                    onPress={() => setIsImportant(!isImportant)}
                                >
                                    <View style={styles.toggleText}>
                                        <Text style={styles.toggleTitle}>Mark as Important</Text>
                                        <Text style={styles.toggleSubtitle}>Triggers high-priority priority alert</Text>
                                    </View>
                                    <View style={[styles.switch, isImportant && styles.switchOn]}>
                                        <View style={[styles.switchThumb, isImportant && styles.switchThumbOn]} />
                                    </View>
                                </Pressable>
                            )}

                            <Button
                                title={`Publish ${typeLabels[postType]}`}
                                onPress={handleSubmit}
                                loading={loading}
                                disabled={!title.trim()}
                                style={styles.submitBtn}
                            />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
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
    keyboardSpacer: {
        width: '100%',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 12,
        maxHeight: '92%',
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
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTitleBox: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#000',
        fontFamily: Typography.family.extraBold,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.accentBlue,
        fontWeight: '700',
        marginTop: 1,
        fontFamily: Typography.family.bold,
    },
    closeBox: {
        width: 32,
        height: 32,
        backgroundColor: '#F2F2F7',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
        fontFamily: Typography.family.bold,
    },
    inputGroup: {
        backgroundColor: '#F9F9FB',
        borderRadius: 20,
        padding: 16,
        gap: 16,
    },
    timeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    row: {
        flexDirection: 'row',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9F9FB',
        borderRadius: 20,
        marginBottom: 24,
    },
    toggleText: {
        flex: 1,
    },
    toggleTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
        fontFamily: Typography.family.bold,
    },
    toggleSubtitle: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginTop: 2,
        fontFamily: Typography.family.regular,
    },
    switch: {
        width: 46,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#E5E5EA',
        padding: 2,
    },
    switchOn: {
        backgroundColor: Colors.accentBlue,
    },
    switchThumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'white',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            }
        })
    },
    switchThumbOn: {
        transform: [{ translateX: 20 }],
    },
    submitBtn: {
        height: 56,
        marginTop: 10,
    },
});
