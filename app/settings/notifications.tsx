import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { useSpaces } from '../../hooks/useSpace';
import { updateUserProfile } from '../../services/authService';
import Divider from '../../components/ui/Divider';
import { Spacing } from '../../constants/spacing';

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const { colors: Colors, typography: Typography } = useTheme();
    const { user, setUser } = useAuthStore();
    const { spaces } = useSpaces();

    const themedStyles = styles(Colors, Typography, Spacing);

    const prefs = user?.notificationPrefs || {
        global: {
            lecture: true,
            assignment: true,
            test: true,
            announcement: true,
        },
        spaces: {},
    };

    const toggleGlobal = async (type: string) => {
        if (!user?.uid) return;

        const newPrefs = {
            ...prefs,
            global: {
                ...prefs.global,
                [type]: !prefs.global[type as keyof typeof prefs.global],
            },
        };

        // Optimistic update
        setUser({ ...user, notificationPrefs: newPrefs });

        try {
            await updateUserProfile(user.uid, { notificationPrefs: newPrefs });
        } catch (error) {
            console.error('Update prefs error:', error);
            // Revert on error
            setUser({ ...user, notificationPrefs: prefs });
        }
    };

    const toggleSpace = async (spaceId: string) => {
        if (!user?.uid) return;

        const newPrefs = {
            ...prefs,
            spaces: {
                ...prefs.spaces,
                [spaceId]: prefs.spaces[spaceId] === undefined ? false : !prefs.spaces[spaceId],
            },
        };

        // Optimistic update
        setUser({ ...user, notificationPrefs: newPrefs });

        try {
            await updateUserProfile(user.uid, { notificationPrefs: newPrefs });
        } catch (error) {
            console.error('Update prefs error:', error);
            // Revert on error
            setUser({ ...user, notificationPrefs: prefs });
        }
    };

    return (
        <SafeAreaView style={themedStyles.container}>
            <View style={themedStyles.header}>
                <TouchableOpacity onPress={() => router.back()} style={themedStyles.headerButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.onSurface} />
                </TouchableOpacity>
                <Text style={themedStyles.title}>Notifications</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={themedStyles.content}>
                <Text style={themedStyles.sectionTitle}>Global Preferences</Text>
                
                <View style={themedStyles.settingRow}>
                    <Text style={themedStyles.settingLabel}>Lectures</Text>
                    <Switch
                        value={prefs.global.lecture}
                        onValueChange={() => toggleGlobal('lecture')}
                        trackColor={{ true: Colors.primary }}
                    />
                </View>

                <View style={themedStyles.settingRow}>
                    <Text style={themedStyles.settingLabel}>Assignments</Text>
                    <Switch
                        value={prefs.global.assignment}
                        onValueChange={() => toggleGlobal('assignment')}
                        trackColor={{ true: Colors.primary }}
                    />
                </View>

                <View style={themedStyles.settingRow}>
                    <Text style={themedStyles.settingLabel}>Tests & Quizzes</Text>
                    <Switch
                        value={prefs.global.test}
                        onValueChange={() => toggleGlobal('test')}
                        trackColor={{ true: Colors.primary }}
                    />
                </View>

                <View style={themedStyles.settingRow}>
                    <Text style={themedStyles.settingLabel}>Announcements</Text>
                    <Switch
                        value={prefs.global.announcement}
                        onValueChange={() => toggleGlobal('announcement')}
                        trackColor={{ true: Colors.primary }}
                    />
                </View>

                <Divider style={{ marginVertical: Spacing.lg }} />

                <Text style={themedStyles.sectionTitle}>Per Space Notifications</Text>
                {spaces.length === 0 ? (
                    <Text style={themedStyles.emptyText}>You haven't joined any spaces yet.</Text>
                ) : (
                    spaces.map((space) => (
                        <View key={space.id} style={themedStyles.settingRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={themedStyles.settingLabel}>{space.name}</Text>
                                <Text style={themedStyles.settingSublabel}>{space.spaceCode}</Text>
                            </View>
                            <Switch
                                value={prefs.spaces[space.id] !== false}
                                onValueChange={() => toggleSpace(space.id)}
                                trackColor={{ true: Colors.primary }}
                            />
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = (Colors: any, Typography: any, Spacing: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: Colors.outlineVariant,
        backgroundColor: Colors.surface,
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 17,
        fontFamily: Typography.family.bold,
        color: Colors.onSurface,
    },
    content: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: Typography.family.bold,
        color: Colors.primary,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    settingLabel: {
        fontSize: 16,
        fontFamily: Typography.family.medium,
        color: Colors.onSurface,
    },
    settingSublabel: {
        fontSize: 12,
        fontFamily: Typography.family.regular,
        color: Colors.onSurfaceVariant,
        marginTop: 2,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: Typography.family.regular,
        color: Colors.onSurfaceVariant,
        textAlign: 'center',
        marginTop: Spacing.lg,
    },
});
