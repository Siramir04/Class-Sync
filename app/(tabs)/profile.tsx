import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useSpaces } from '../../hooks/useSpace';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import Tag from '../../components/ui/Tag';
import Divider from '../../components/ui/Divider';
import Button from '../../components/ui/Button';
import { useSpaceStore } from '../../store/spaceStore';
import { logoutUser, changePassword, updateUserProfile } from '../../services/authService';
import { format } from 'date-fns';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const logout = useAuthStore((s) => s.logout);
    const { spaces } = useSpaces();
    const { carryoverCourses } = useSpaceStore();

    const handleLogout = async () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    await logoutUser();
                    logout();
                    router.replace('/(auth)/login');
                },
            },
        ]);
    };

    const handleChangePassword = () => {
        if (!Alert.prompt) {
            Alert.alert('Change Password', 'This feature is only available on iOS.');
            return;
        }
        Alert.prompt('Change Password', 'Enter your new password:', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Update',
                onPress: async (newPassword?: string) => {
                    if (newPassword && newPassword.length >= 6) {
                        try {
                            await changePassword(newPassword);
                            Alert.alert('Success', 'Password updated successfully.');
                        } catch {
                            Alert.alert('Error', 'Could not update password.');
                        }
                    }
                },
            },
        ]);
    };

    const handleUpdateRegNumber = () => {
        if (!Alert.prompt) {
            Alert.alert('Registration Number', 'Please use a device that supports prompts or contact support.');
            return;
        }
        Alert.prompt(
            'Registration Number',
            'Required for attendance tracking:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Update',
                    onPress: async (regNumber?: string) => {
                        if (regNumber && regNumber.trim()) {
                            try {
                                await updateUserProfile(user!.uid, { regNumber: regNumber.trim() });
                                // Update local store
                                useAuthStore.getState().setUser({ ...user!, regNumber: regNumber.trim() });
                                Alert.alert('Success', 'Registration number updated.');
                            } catch (error) {
                                Alert.alert('Error', 'Could not update registration number.');
                            }
                        }
                    },
                },
            ],
            'plain-text',
            user?.regNumber || ''
        );
    };

    const roleLabel =
        user?.role === 'monitor'
            ? 'Monitor'
            : user?.role === 'assistant_monitor'
                ? 'Assistant Monitor'
                : user?.role === 'lecturer'
                    ? 'Lecturer'
                    : 'Student';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <Avatar name={user?.fullName || '?'} size={72} />
                    <Text style={styles.fullName}>{user?.fullName}</Text>
                    <Text style={styles.university}>{user?.university}</Text>
                    {user?.regNumber && (
                        <Text style={styles.regNumber}>{user.regNumber}</Text>
                    )}
                    <Tag label={roleLabel} variant="role" style={styles.roleTag} />
                    <Text style={styles.memberSince}>
                        Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : '—'}
                    </Text>
                </View>

                <Divider />

                {/* My Spaces */}
                <Text style={styles.sectionTitle}>My Spaces</Text>
                {spaces.map((space) => (
                    <TouchableOpacity
                        key={space.id}
                        style={styles.spaceRow}
                        onPress={() => router.push(`/space/${space.id}`)}
                    >
                        <View style={styles.spaceRowLeft}>
                            <Text style={styles.spaceRowName}>{space.name}</Text>
                            <Text style={styles.spaceRowCode}>{space.spaceCode}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.border} />
                    </TouchableOpacity>
                ))}

                {carryoverCourses.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: Colors.carryover }]}>
                            Carryover Courses
                        </Text>
                        {carryoverCourses.map((course) => (
                            <View key={course.id} style={styles.spaceRow}>
                                <View style={styles.spaceRowLeft}>
                                    <Text style={styles.spaceRowName}>{course.courseName}</Text>
                                    <Text style={[styles.spaceRowCode, { color: Colors.carryover }]}>
                                        {course.fullCode}
                                    </Text>
                                </View>
                                <Tag label="Carryover" variant="carryover" />
                            </View>
                        ))}
                    </>
                )}

                <Divider />

                {/* Settings */}
                <Text style={styles.sectionTitle}>Settings</Text>

                <TouchableOpacity style={styles.settingsRow} onPress={handleUpdateRegNumber}>
                    <Ionicons name="id-card-outline" size={20} color={Colors.textSecondary} />
                    <Text style={styles.settingsLabel}>Registration Number</Text>
                    <Text style={styles.settingsValue}>{user?.regNumber || 'Not set'}</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.border} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingsRow}>
                    <Ionicons name="create-outline" size={20} color={Colors.textSecondary} />
                    <Text style={styles.settingsLabel}>Edit Profile</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.border} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingsRow}>
                    <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
                    <Text style={styles.settingsLabel}>Notification Preferences</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.border} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingsRow} onPress={handleChangePassword}>
                    <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                    <Text style={styles.settingsLabel}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.border} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingsRow}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
                    <Text style={styles.settingsLabel}>About ClassSync</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.border} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={styles.logoutLabel}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: Spacing.xxl }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: Spacing.screenPadding,
        paddingTop: Spacing.xl,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    fullName: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        marginTop: Spacing.md,
    },
    university: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    regNumber: {
        ...Typography.codeDisplay,
        fontSize: 14,
        color: Colors.accentBlue,
        marginTop: 4,
    },
    roleTag: {
        marginTop: Spacing.sm,
    },
    memberSince: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
    },
    sectionTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    spaceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '30',
    },
    spaceRowLeft: {
        flex: 1,
    },
    spaceRowName: {
        ...Typography.body,
        color: Colors.textPrimary,
        fontWeight: '600',
    },
    spaceRowCode: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '30',
    },
    settingsLabel: {
        ...Typography.body,
        color: Colors.textPrimary,
        flex: 1,
        marginLeft: Spacing.md,
    },
    settingsValue: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginRight: Spacing.sm,
    },
    logoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        marginTop: Spacing.md,
    },
    logoutLabel: {
        ...Typography.body,
        color: Colors.error,
        marginLeft: Spacing.md,
        fontWeight: '600',
    },
});
