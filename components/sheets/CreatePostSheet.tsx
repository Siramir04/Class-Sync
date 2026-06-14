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
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
import { PostType } from '../../types';
import Input from '../ui/Input';
import { Button } from '../ui/Button';
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
    const { colors: Colors } = useTheme();
    const themedStyles = styles(Colors);
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
            <View style={themedStyles.overlay}>
                <Pressable style={themedStyles.backdrop} onPress={onClose} />
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={themedStyles.keyboardSpacer}
                >
                    <View style={themedStyles.sheet}>
                        <View style={themedStyles.handle} />
                        
                        <View style={themedStyles.header}>
                           <View style={[themedStyles.iconBox, { backgroundColor: Colors.primary + '15' }]}>
                               <IconComponent size={24} color={Colors.primary} />
                           </View>
                           <View style={themedStyles.headerTitleBox}>
                             <Text style={themedStyles.title}>New {typeLabels[postType]}</Text>
                             <Text style={themedStyles.subtitle}>{courseCode}</Text>
                           </View>
                           <Pressable onPress={onClose} style={themedStyles.closeBox}>
                             <LucideIcons.X size={20} color={Colors.textTertiary} />
                           </Pressable>
                        </View>

                        <ScrollView 
                            showsVerticalScrollIndicator={false} 
                            contentContainerStyle={themedStyles.scrollContent}
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
                                <View style={themedStyles.section}>
                                    <Text style={themedStyles.sectionLabel}>Schedule</Text>
                                    <View style={themedStyles.inputGroup}>
                                      <CustomDateTimePicker
                                          label="Date"
                                          value={lectureDate}
                                          mode="date"
                                          onChange={setLectureDate}
                                      />
                                      <View style={themedStyles.timeRow}>
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
                                <View style={themedStyles.section}>
                                    <Text style={themedStyles.sectionLabel}>Deadline</Text>
                                    <CustomDateTimePicker
                                        label="Due Date"
                                        value={dueDate}
                                        mode="date"
                                        onChange={setDueDate}
                                    />
                                </View>
                            )}

                            {(showMarksField || showTopicsField) && (
                              <View style={themedStyles.section}>
                                <Text style={themedStyles.sectionLabel}>Assessment Info</Text>
                                <View style={themedStyles.row}>
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
                                    style={themedStyles.toggleRow} 
                                    onPress={() => setIsImportant(!isImportant)}
                                >
                                    <View style={themedStyles.toggleText}>
                                        <Text style={themedStyles.toggleTitle}>Mark as Important</Text>
                                        <Text style={themedStyles.toggleSubtitle}>Triggers high-priority priority alert</Text>
                                    </View>
                                    <View style={[themedStyles.switch, isImportant && themedStyles.switchOn]}>
                                        <View style={[themedStyles.switchThumb, isImportant && themedStyles.switchThumbOn]} />
                                    </View>
                                </Pressable>
                            )}

                            <Button
                                label={`Publish ${typeLabels[postType]}`}
                                onPress={handleSubmit}
                                loading={loading}
                                disabled={!title.trim()}
                                style={themedStyles.submitBtn}
                            />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = (Colors: any) => StyleSheet.create({
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
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 12,
        maxHeight: '92%',
    },
    handle: {
        width: 38,
        height: 5,
        backgroundColor: Colors.separator,
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
        color: Colors.textPrimary,
        fontFamily: Typography.family.extraBold,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '700',
        marginTop: 1,
        fontFamily: Typography.family.bold,
    },
    closeBox: {
        width: 32,
        height: 32,
        backgroundColor: Colors.surfaceSecondary,
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
        backgroundColor: Colors.surfaceSecondary,
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
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: 20,
        marginBottom: 24,
    },
    toggleText: {
        flex: 1,
    },
    toggleTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
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
        backgroundColor: Colors.separator,
        padding: 2,
    },
    switchOn: {
        backgroundColor: Colors.primary,
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
