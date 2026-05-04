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
import { useTheme } from '../hooks/useTheme';
import { Spacing } from '../constants/spacing';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import Card from '../components/ui/Card';
import { joinSpaceByCode, createSpace } from '../services/spaceService';
import { joinCourseByCode } from '../services/courseService';
import { generateSpaceCode } from '../services/codeService';

type Mode = 'join' | 'create';

export default function JoinScreen() {
    const router = useRouter();
    const { colors: Colors, typography: Typography } = useTheme();
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
            if (code.startsWith('SP-')) {
                await joinSpaceByCode(code.trim(), user.uid, user.role);
                Alert.alert('Success', 'You joined the space!');
                router.replace('/(tabs)/spaces');
            } else if (code.startsWith('CR-')) {
                await joinCourseByCode(code.trim(), user.uid, user.role);
                Alert.alert('Success', 'Course join request sent!');
                router.replace('/(tabs)/spaces');
            } else {
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
                user.uid,
                validCourses
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
        <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Custom Header */}
                <View style={[styles.header, { backgroundColor: Colors.surface, borderBottomColor: Colors.separator }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: Colors.textPrimary, fontFamily: Typography.family.bold }]}>
                        {mode === 'join' ? 'Join Community' : 'Create New Space'}
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Segmented Control */}
                <View style={styles.segmentContainer}>
                    <View style={[styles.segmentedControl, { backgroundColor: Colors.surface, borderColor: Colors.separator }]}>
                            <TouchableOpacity
                                style={[styles.segment, mode === 'join' && [styles.segmentActive, { backgroundColor: Colors.accentBlue }]]}
                                onPress={() => setMode('join')}
                                activeOpacity={0.7}
                            >
                            <Text style={[styles.segmentText, { color: Colors.textSecondary, fontFamily: Typography.family.semiBold }, mode === 'join' && { color: Colors.white }]}>
                                Join
                            </Text>
                        </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.segment, mode === 'create' && [styles.segmentActive, { backgroundColor: Colors.accentBlue }]]}
                                onPress={() => setMode('create')}
                                activeOpacity={0.7}
                            >
                            <Text style={[styles.segmentText, { color: Colors.textSecondary, fontFamily: Typography.family.semiBold }, mode === 'create' && { color: Colors.white }]}>
                                Create
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {mode === 'join' ? (
                        <View style={styles.joinContainer}>
                            <View style={[styles.infoCard, { backgroundColor: Colors.accentBlue + '08', borderColor: Colors.accentBlue + '20' }]}>
                                <Ionicons name="information-circle-outline" size={20} color={Colors.accentBlue} />
                                <Text style={[styles.infoText, { color: Colors.accentBlue, fontFamily: (Typography as any).family.medium }]}>
                                    Communities are private. Ask your Class Monitor or Course Rep for the unique space or course code.
                                </Text>
                            </View>

                            <Input
                                label="ENTER CODE"
                                value={code}
                                onChangeText={(v) => {
                                    setCode(v.toUpperCase());
                                    setJoinError('');
                                }}
                                placeholder="e.g. SP-7K2M"
                                autoCapitalize="characters"
                                error={joinError}
                                containerStyle={styles.inputContainer}
                            />
                            
                            <View style={styles.buttonContainer}>
                                <Button 
                                    label="Join Community" 
                                    onPress={handleJoin} 
                                    loading={joinLoading} 
                                    style={styles.primaryBtn}
                                />
                            </View>
                            
                            <View style={[styles.helpBox, { backgroundColor: Colors.surface, borderColor: Colors.separator }]}>
                                <Text style={[styles.helpTitle, { color: Colors.textPrimary, fontFamily: Typography.family.bold }]}>What are codes?</Text>
                                <Text style={[styles.helpText, { color: Colors.textSecondary, fontFamily: Typography.family.regular }]}>• SP-XXXX: Joins a full class space{'\n'}• CR-XXXX: Joins a specific carryover course</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.createContainer}>
                            <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Typography.family.bold }]}>SPACE INFORMATION</Text>
                            <Card style={styles.formCard}>
                                <Input
                                    label="SPACE NAME"
                                    value={spaceName}
                                    onChangeText={setSpaceName}
                                    placeholder="e.g. Computer Science 300L"
                                    error={createErrors.spaceName}
                                />
                                <Input
                                    label="DEPARTMENT"
                                    value={department}
                                    onChangeText={setDepartment}
                                    placeholder="e.g. Numerical Analysis"
                                    error={createErrors.department}
                                />
                                <View style={styles.row}>
                                    <View style={{ flex: 2, marginRight: 12 }}>
                                        <Input
                                            label="PROGRAMME"
                                            value={programme}
                                            onChangeText={setProgramme}
                                            placeholder="e.g. B.Sc."
                                            error={createErrors.programme}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Input
                                            label="LEVEL"
                                            value={level}
                                            onChangeText={setLevel}
                                            placeholder="300"
                                            keyboardType="number-pad"
                                            error={createErrors.level}
                                        />
                                    </View>
                                </View>
                            </Card>

                            <Text style={[styles.sectionLabel, { marginTop: 24, color: Colors.textTertiary, fontFamily: Typography.family.bold }]}>COURSES</Text>
                            {createErrors.courses && (
                                <Text style={[styles.errorText, { color: Colors.error, fontFamily: (Typography as any).family.medium }]}>{createErrors.courses}</Text>
                            )}
                            
                            {courseCodes.map((course, index) => (
                                <Card key={index} style={[styles.courseCard, { backgroundColor: Colors.surface }]}>
                                    <View style={styles.courseHeader}>
                                        <Text style={[styles.courseIndex, { color: Colors.accentBlue, fontFamily: Typography.family.bold }]}>Course #{index + 1}</Text>
                                        {courseCodes.length > 1 && (
                                            <TouchableOpacity onPress={() => removeCourse(index)} activeOpacity={0.7}>
                                                <Ionicons name="trash-outline" size={18} color={Colors.error} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 12 }}>
                                            <Input
                                                label="CODE"
                                                value={course.courseCode}
                                                onChangeText={(v) => updateCourse(index, 'courseCode', v.toUpperCase())}
                                                placeholder="CSC301"
                                                containerStyle={{ marginBottom: 0 }}
                                            />
                                        </View>
                                        <View style={{ flex: 2 }}>
                                            <Input
                                                label="COURSE NAME"
                                                value={course.courseName}
                                                onChangeText={(v) => updateCourse(index, 'courseName', v)}
                                                placeholder="Data Structures"
                                                containerStyle={{ marginBottom: 0 }}
                                            />
                                        </View>
                                    </View>
                                </Card>
                            ))}

                            <TouchableOpacity style={[styles.addBtn, { backgroundColor: Colors.accentBlue + '05', borderColor: Colors.accentBlue + '30' }]} onPress={addCourse} activeOpacity={0.7}>
                                <Ionicons name="add-circle" size={24} color={Colors.accentBlue} />
                                <Text style={[styles.addBtnText, { color: Colors.accentBlue, fontFamily: Typography.family.bold }]}>Add Another Course</Text>
                            </TouchableOpacity>

                            <View style={styles.buttonContainer}>
                                <Button
                                    label="Create Community Space"
                                    onPress={handleCreate}
                                    loading={createLoading}
                                    style={styles.createBtn}
                                />
                            </View>
                        </View>
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 56,
        borderBottomWidth: 1,
    },
    headerIconButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
    },
    segmentContainer: {
        paddingHorizontal: Spacing.screenPadding,
        paddingVertical: 12,
    },
    segmentedControl: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    segment: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    segmentActive: {
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    segmentText: {
        fontSize: 14,
    },
    scrollContent: {
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: 12,
    },
    joinContainer: {
        flex: 1,
    },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'flex-start',
        borderWidth: 1,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 24,
    },
    buttonContainer: {
        marginTop: 8,
    },
    primaryBtn: {
        height: 56,
        borderRadius: 16,
    },
    helpBox: {
        marginTop: 32,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
    },
    helpTitle: {
        fontSize: 15,
        marginBottom: 8,
    },
    helpText: {
        fontSize: 13,
        lineHeight: 20,
    },
    createContainer: {},
    sectionLabel: {
        fontSize: 11,
        letterSpacing: 1.2,
        marginBottom: 12,
        marginLeft: 4,
    },
    formCard: {
        padding: 16,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
    },
    errorText: {
        fontSize: 12,
        marginBottom: 12,
        marginLeft: 4,
    },
    courseCard: {
        padding: 16,
        marginBottom: 12,
    },
    courseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    courseIndex: {
        fontSize: 13,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginTop: 8,
    },
    addBtnText: {
        fontSize: 15,
    },
    createBtn: {
        marginTop: 32,
        height: 56,
        borderRadius: 16,
    },
});
