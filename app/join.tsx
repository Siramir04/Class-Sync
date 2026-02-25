import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Divider from '../components/ui/Divider';
import { joinSpaceByCode, createSpace } from '../services/spaceService';
import { joinCourseByCode } from '../services/courseService';
import { generateSpaceCode } from '../services/codeService';

type Mode = 'join' | 'create';

export default function JoinScreen() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [mode, setMode] = useState<Mode>('join');

    // Join mode state
    const [code, setCode] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinError, setJoinError] = useState('');

    // Create mode state
    const [spaceName, setSpaceName] = useState('');
    const [programme, setProgramme] = useState('');
    const [department, setDepartment] = useState('');
    const [level, setLevel] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

    // Course codes for create
    const [courseCodes, setCourseCodes] = useState<{ courseCode: string; courseName: string }[]>([
        { courseCode: '', courseName: '' },
    ]);

    const handleJoin = async () => {
        if (!code.trim()) {
            setJoinError('Please enter a code');
            return;
        }
        if (!user?.uid) return;

        setJoinLoading(true);
        setJoinError('');
        try {
            // Try space code first
            if (code.startsWith('SP-')) {
                await joinSpaceByCode(code.trim(), user.uid, user.role);
                Alert.alert('Success', 'You joined the space!');
                router.replace('/(tabs)/spaces');
            } else if (code.startsWith('CR-')) {
                // Course code (carryover)
                await joinCourseByCode(code.trim(), user.uid, user.role);
                Alert.alert('Success', 'Course join request sent!');
                router.replace('/(tabs)/spaces');
            } else {
                // Try both
                try {
                    await joinSpaceByCode(code.trim(), user.uid, user.role);
                    Alert.alert('Success', 'You joined the space!');
                    router.replace('/(tabs)/spaces');
                } catch {
                    await joinCourseByCode(code.trim(), user.uid, user.role);
                    Alert.alert('Success', 'Course join request sent!');
                    router.replace('/(tabs)/spaces');
                }
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Invalid code';
            setJoinError(message);
        } finally {
            setJoinLoading(false);
        }
    };

    const handleCreate = async () => {
        const errors: Record<string, string> = {};
        if (!spaceName.trim()) errors.spaceName = 'Space name is required';
        if (!programme.trim()) errors.programme = 'Programme is required';
        if (!department.trim()) errors.department = 'Department is required';
        if (!level.trim()) errors.level = 'Level is required';

        const validCourses = courseCodes.filter(
            (c) => c.courseCode.trim() && c.courseName.trim()
        );
        if (validCourses.length === 0) {
            errors.courses = 'Add at least one course';
        }

        setCreateErrors(errors);
        if (Object.keys(errors).length > 0) return;
        if (!user?.uid) return;

        setCreateLoading(true);
        try {
            const spaceCode = generateSpaceCode(user.university || '', department.trim(), level.trim());
            const spaceId = await createSpace(
                spaceName.trim(),
                user.university || '',
                department.trim(),
                programme.trim(),
                level.trim(),
                spaceCode,
                user.uid
            );
            Alert.alert('Success', `Space created! Code: ${spaceCode}`);
            router.replace(`/space/${spaceId}`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Could not create space';
            Alert.alert('Error', message);
        } finally {
            setCreateLoading(false);
        }
    };

    const addCourse = () => {
        setCourseCodes([...courseCodes, { courseCode: '', courseName: '' }]);
    };

    const updateCourse = (index: number, field: 'courseCode' | 'courseName', value: string) => {
        const updated = [...courseCodes];
        updated[index][field] = value;
        setCourseCodes(updated);
    };

    const removeCourse = (index: number) => {
        if (courseCodes.length <= 1) return;
        setCourseCodes(courseCodes.filter((_, i) => i !== index));
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {mode === 'join' ? 'Join Space' : 'Create Space'}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Mode Toggle */}
                <View style={styles.modeToggle}>
                    <TouchableOpacity
                        style={[styles.modeBtn, mode === 'join' && styles.modeBtnActive]}
                        onPress={() => setMode('join')}
                    >
                        <Text style={[styles.modeBtnText, mode === 'join' && styles.modeBtnTextActive]}>
                            Join
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeBtn, mode === 'create' && styles.modeBtnActive]}
                        onPress={() => setMode('create')}
                    >
                        <Text style={[styles.modeBtnText, mode === 'create' && styles.modeBtnTextActive]}>
                            Create
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {mode === 'join' ? (
                        <>
                            <Text style={styles.instruction}>
                                Enter a space code (SP-XXXX) or a course code (CR-XXXX) to join.
                            </Text>
                            <Input
                                label="Code"
                                value={code}
                                onChangeText={(v) => {
                                    setCode(v.toUpperCase());
                                    setJoinError('');
                                }}
                                placeholder="e.g. SP-7K2M or CR-4P9Q"
                                autoCapitalize="characters"
                                error={joinError}
                            />
                            <Button title="Join" onPress={handleJoin} loading={joinLoading} />
                        </>
                    ) : (
                        <>
                            <Input
                                label="Space Name"
                                value={spaceName}
                                onChangeText={setSpaceName}
                                placeholder="e.g. CS 300L Class 2024"
                                error={createErrors.spaceName}
                            />
                            <Input
                                label="Programme"
                                value={programme}
                                onChangeText={setProgramme}
                                placeholder="e.g. Computer Science"
                                error={createErrors.programme}
                            />
                            <Input
                                label="Department"
                                value={department}
                                onChangeText={setDepartment}
                                placeholder="e.g. Computer Science"
                                error={createErrors.department}
                            />
                            <Input
                                label="Level"
                                value={level}
                                onChangeText={setLevel}
                                placeholder="e.g. 300"
                                keyboardType="number-pad"
                                error={createErrors.level}
                            />

                            <Divider />

                            <Text style={styles.sectionTitle}>Courses</Text>
                            {createErrors.courses && (
                                <Text style={styles.courseError}>{createErrors.courses}</Text>
                            )}
                            {courseCodes.map((course, index) => (
                                <View key={index} style={styles.courseRow}>
                                    <View style={styles.courseInputs}>
                                        <Input
                                            label="Course Code"
                                            value={course.courseCode}
                                            onChangeText={(v) => updateCourse(index, 'courseCode', v.toUpperCase())}
                                            placeholder="e.g. CSC301"
                                        />
                                        <Input
                                            label="Course Name"
                                            value={course.courseName}
                                            onChangeText={(v) => updateCourse(index, 'courseName', v)}
                                            placeholder="e.g. Data Structures"
                                        />
                                    </View>
                                    {courseCodes.length > 1 && (
                                        <TouchableOpacity
                                            onPress={() => removeCourse(index)}
                                            style={styles.removeBtn}
                                        >
                                            <Ionicons name="close-circle" size={22} color={Colors.error} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            <TouchableOpacity style={styles.addCourseBtn} onPress={addCourse}>
                                <Ionicons name="add-circle-outline" size={20} color={Colors.accentBlue} />
                                <Text style={styles.addCourseText}>Add another course</Text>
                            </TouchableOpacity>

                            <Button
                                title="Create Space"
                                onPress={handleCreate}
                                loading={createLoading}
                                style={{ marginTop: Spacing.lg }}
                            />
                        </>
                    )}

                    <View style={{ height: Spacing.xxl }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
    },
    modeToggle: {
        flexDirection: 'row',
        marginHorizontal: Spacing.screenPadding,
        backgroundColor: Colors.subtleFill,
        borderRadius: Spacing.pillRadius,
        padding: 4,
        marginBottom: Spacing.lg,
    },
    modeBtn: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        borderRadius: Spacing.pillRadius,
    },
    modeBtnActive: {
        backgroundColor: Colors.accentBlue,
    },
    modeBtnText: {
        ...Typography.buttonText,
        color: Colors.textSecondary,
    },
    modeBtnTextActive: {
        color: Colors.white,
    },
    content: {
        paddingHorizontal: Spacing.screenPadding,
    },
    instruction: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    courseError: {
        ...Typography.label,
        color: Colors.error,
        marginBottom: Spacing.sm,
    },
    courseRow: {
        marginBottom: Spacing.md,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    courseInputs: {
        flex: 1,
    },
    removeBtn: {
        marginTop: 28,
        marginLeft: 8,
        padding: 4,
    },
    addCourseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: Spacing.md,
    },
    addCourseText: {
        ...Typography.buttonText,
        color: Colors.accentBlue,
    },
});
