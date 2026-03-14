import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import { logoutUser } from '../../services/authService';
import { format } from 'date-fns';

export default function ProfileScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out of your account?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await logoutUser();
                    logout();
                    router.replace('/(auth)/login');
                },
            },
        ]);
    };

    const roleLabel =
        user?.role === 'monitor'
            ? 'Class Monitor'
            : user?.role === 'assistant_monitor'
                ? 'Assistant Monitor'
                : user?.role === 'lecturer'
                    ? 'Lecturer'
                    : 'Student';

    const SettingItem = ({ 
        icon, 
        label, 
        value, 
        onPress, 
        color = Colors.textPrimary,
        showBadge = false
    }: { 
        icon: string, 
        label: string, 
        value?: string, 
        onPress: () => void,
        color?: string,
        showBadge?: boolean
    }) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: color === Colors.error ? Colors.error + '10' : Colors.surface }]}>
                <Ionicons name={icon as any} size={20} color={color === Colors.textPrimary ? Colors.primaryBlue : color} />
            </View>
            <Text style={[styles.settingLabel, { color }]}>{label}</Text>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            {showBadge && <View style={styles.badge} />}
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Hero */}
                <View style={styles.hero}>
                    <View style={styles.avatarContainer}>
                        <Avatar name={user?.fullName || '?'} size={80} />
                        <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
                            <Ionicons name="camera" size={16} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.fullName}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{roleLabel}</Text>
                    </View>
                </View>

                {/* Stats / Info Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{user?.university?.split(' ').map(w => w[0]).join('')}</Text>
                        <Text style={styles.statLabel}>Uni</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{user?.regNumber ? 'Set' : 'No'}</Text>
                        <Text style={styles.statLabel}>Reg ID</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {user?.createdAt ? format(new Date(user.createdAt), 'yyyy') : '—'}
                        </Text>
                        <Text style={styles.statLabel}>Joined</Text>
                    </View>
                </View>

                {/* Account Settings */}
                <Text style={styles.sectionLabel}>ACCOUNT</Text>
                <Card style={styles.settingsCard}>
                    <SettingItem 
                        icon="person-outline" 
                        label="Personal Information" 
                        onPress={() => router.push('/settings/edit-profile')} 
                    />
                    <View style={styles.rowDivider} />
                    <SettingItem 
                        icon="lock-closed-outline" 
                        label="Security & Password" 
                        onPress={() => router.push('/settings/change-password')} 
                    />
                    <View style={styles.rowDivider} />
                    <SettingItem 
                        icon="notifications-outline" 
                        label="Notifications" 
                        onPress={() => router.push('/settings/notifications')} 
                    />
                </Card>

                {/* Preferences & Support */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>PREFERENCES</Text>
                <Card style={styles.settingsCard}>
                    <SettingItem 
                        icon="color-palette-outline" 
                        label="Appearance" 
                        value="System"
                        onPress={() => {}} 
                    />
                    <View style={styles.rowDivider} />
                    <SettingItem 
                        icon="help-circle-outline" 
                        label="Help & Support" 
                        onPress={() => {}} 
                    />
                    <View style={styles.rowDivider} />
                    <SettingItem 
                        icon="information-circle-outline" 
                        label="About ClassSync" 
                        onPress={() => router.push('/settings/about')} 
                    />
                </Card>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>ClassSync v2.1.0 (MVP)</Text>
                
                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 120,
    },
    hero: {
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPadding,
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primaryBlue,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.background,
    },
    userName: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: Colors.primaryBlue + '12',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    roleText: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: Colors.primaryBlue,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        marginHorizontal: Spacing.screenPadding,
        borderRadius: 16,
        paddingVertical: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: Colors.border + '15',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textTertiary,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: Colors.border + '15',
        alignSelf: 'center',
    },
    sectionLabel: {
        fontSize: 11,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textTertiary,
        letterSpacing: 1.2,
        marginBottom: 10,
        marginLeft: Spacing.screenPadding + 4,
    },
    settingsCard: {
        marginHorizontal: Spacing.screenPadding,
        padding: 0,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingLabel: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'DMSans_500Medium',
    },
    settingValue: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
        marginRight: 8,
    },
    badge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.error,
        marginRight: 8,
    },
    rowDivider: {
        height: 1,
        backgroundColor: Colors.border + '10',
        marginLeft: 60,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginHorizontal: Spacing.screenPadding,
        marginTop: 32,
        backgroundColor: Colors.error + '08',
        borderRadius: 16,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: Colors.error,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textTertiary,
        marginTop: 24,
    },
});
