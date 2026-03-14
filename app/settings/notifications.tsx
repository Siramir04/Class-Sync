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
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useSpaces } from '../../hooks/useSpace';
import { updateUserProfile } from '../../services/authService';
import Divider from '../../components/ui/Divider';

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();
    const { spaces } = useSpaces();

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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Global Preferences</Text>
                
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Lectures</Text>
                    <Switch
                        value={prefs.global.lecture}
                        onValueChange={() => toggleGlobal('lecture')}
                        trackColor={{ true: Colors.accentBlue }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Assignments</Text>
                    <Switch
                        value={prefs.global.assignment}
                        onValueChange={() => toggleGlobal('assignment')}
                        trackColor={{ true: Colors.accentBlue }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Tests & Quizzes</Text>
                    <Switch
                        value={prefs.global.test}
                        onValueChange={() => toggleGlobal('test')}
                        trackColor={{ true: Colors.accentBlue }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Announcements</Text>
                    <Switch
                        value={prefs.global.announcement}
                        onValueChange={() => toggleGlobal('announcement')}
                        trackColor={{ true: Colors.accentBlue }}
                    />
                </View>

                <Divider style={{ marginVertical: Spacing.lg }} />

                <Text style={styles.sectionTitle}>Per Space Notifications</Text>
                {spaces.length === 0 ? (
                    <Text style={styles.emptyText}>You haven't joined any spaces yet.</Text>
                ) : (
                    spaces.map((space) => (
                        <View key={space.id} style={styles.settingRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.settingLabel}>{space.name}</Text>
                                <Text style={styles.settingSublabel}>{space.spaceCode}</Text>
                            </View>
                            <Switch
                                value={prefs.spaces[space.id] !== false}
                                onValueChange={() => toggleSpace(space.id)}
                                trackColor={{ true: Colors.accentBlue }}
                            />
                        </View>
                    ))
                )}
            </ScrollView>
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
        paddingHorizontal: 8,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '30',
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
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    content: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        ...Typography.sectionHeader,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    settingLabel: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    settingSublabel: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    emptyText: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.lg,
    },
});
