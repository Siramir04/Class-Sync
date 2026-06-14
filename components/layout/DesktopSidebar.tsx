// components/layout/DesktopSidebar.tsx
// Fixed left sidebar for desktop web — collapses to icon-only on smaller widths
import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Image,
    useWindowDimensions,
} from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';

interface NavItem {
    label: string;
    icon: keyof typeof LucideIcons;
    route: string;
    /** Segment name to match for active state */
    segment: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', icon: 'House', route: '/(tabs)', segment: '(tabs)' },
    { label: 'Schedule', icon: 'CalendarDays', route: '/(tabs)/schedule', segment: 'schedule' },
    { label: 'Spaces', icon: 'LayoutGrid', route: '/(tabs)/spaces', segment: 'spaces' },
    { label: 'Profile', icon: 'UserRound', route: '/(tabs)/profile', segment: 'profile' },
    { label: 'Settings', icon: 'Settings', route: '/settings/about', segment: 'settings' },
];

const SIDEBAR_FULL = 260;
const SIDEBAR_COLLAPSED = 68;
const COLLAPSE_THRESHOLD = 1280;

export default function DesktopSidebar() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const segments = useSegments();
    const { user } = useAuthStore();
    const { width: windowWidth } = useWindowDimensions();

    const isCollapsed = windowWidth < COLLAPSE_THRESHOLD;
    const sidebarWidth = isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_FULL;

    const firstName = user?.fullName?.split(' ')[0] || 'User';
    const lastName = user?.fullName?.split(' ')[1] || '';

    const isActive = (item: NavItem): boolean => {
        const currentSegment = segments[0] || '';
        const secondSegment = segments[1] || '';

        // Dashboard: active when on (tabs) root (index)
        if (item.segment === '(tabs)') {
            return currentSegment === '(tabs)' && (!secondSegment || secondSegment === 'index');
        }
        // Settings
        if (item.segment === 'settings') {
            return currentSegment === 'settings';
        }
        // Others: match second segment within (tabs)
        return currentSegment === '(tabs)' && secondSegment === item.segment;
    };

    const handleNav = (route: string) => {
        router.push(route as any);
    };

    return (
        <View
            style={[
                styles.container,
                {
                    width: sidebarWidth,
                    backgroundColor: isDark ? '#0A0A0C' : '#FAFAFA',
                    borderRightColor: colors.separator,
                },
            ]}
        >
            {/* Branding */}
            <View style={styles.brandingContainer}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                {!isCollapsed && (
                    <Text
                        style={[
                            styles.brandText,
                            { color: colors.onSurface },
                        ]}
                    >
                        ClassSync
                    </Text>
                )}
            </View>

            {/* Navigation */}
            <View style={styles.navContainer}>
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item);
                    const IconComponent = LucideIcons[item.icon] as React.ComponentType<any>;

                    return (
                        <Pressable
                            key={item.route}
                            onPress={() => handleNav(item.route)}
                            style={({ hovered, pressed }: any) => [
                                styles.navItem,
                                isCollapsed && styles.navItemCollapsed,
                                active && {
                                    backgroundColor: isDark
                                        ? 'rgba(10,132,255,0.12)'
                                        : 'rgba(0,122,255,0.08)',
                                },
                                !active && hovered && {
                                    backgroundColor: isDark
                                        ? 'rgba(255,255,255,0.04)'
                                        : 'rgba(0,0,0,0.03)',
                                },
                                pressed && { opacity: 0.8 },
                            ]}
                        >
                            <View
                                style={[
                                    styles.iconContainer,
                                    active && {
                                        backgroundColor: isDark
                                            ? 'rgba(10,132,255,0.2)'
                                            : 'rgba(0,122,255,0.12)',
                                    },
                                ]}
                            >
                                <IconComponent
                                    size={20}
                                    color={
                                        active
                                            ? colors.primary
                                            : colors.onSurfaceVariant
                                    }
                                    strokeWidth={active ? 2.5 : 1.8}
                                />
                            </View>
                            {!isCollapsed && (
                                <Text
                                    style={[
                                        styles.navLabel,
                                        {
                                            color: active
                                                ? colors.primary
                                                : colors.onSurfaceVariant,
                                            fontWeight: active ? '700' : '500',
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.label}
                                </Text>
                            )}

                            {/* Active bar indicator */}
                            {active && (
                                <View
                                    style={[
                                        styles.activeBar,
                                        { backgroundColor: colors.primary },
                                    ]}
                                />
                            )}
                        </Pressable>
                    );
                })}
            </View>

            {/* User footer */}
            <View style={[styles.userFooter, { borderTopColor: colors.separator }]}>
                <Pressable
                    onPress={() => handleNav('/(tabs)/profile')}
                    style={({ hovered }: any) => [
                        styles.userButton,
                        isCollapsed && styles.userButtonCollapsed,
                        hovered && {
                            backgroundColor: isDark
                                ? 'rgba(255,255,255,0.04)'
                                : 'rgba(0,0,0,0.03)',
                        },
                    ]}
                >
                    <Avatar firstName={firstName} lastName={lastName} size="sm" />
                    {!isCollapsed && (
                        <View style={styles.userInfo}>
                            <Text
                                style={[styles.userName, { color: colors.onSurface }]}
                                numberOfLines={1}
                            >
                                {user?.fullName || 'User'}
                            </Text>
                            <Text
                                style={[styles.userRole, { color: colors.onSurfaceVariant }]}
                                numberOfLines={1}
                            >
                                {user?.role || 'Student'}
                            </Text>
                        </View>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        borderRightWidth: 1,
        paddingTop: 20,
        paddingBottom: 12,
        flexShrink: 0,
    },
    brandingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 8,
        gap: 10,
    },
    logo: {
        width: 34,
        height: 34,
        borderRadius: 8,
    },
    brandText: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
        fontFamily: 'DMSans_700Bold',
    },
    navContainer: {
        flex: 1,
        paddingHorizontal: 10,
        gap: 2,
        marginTop: 4,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 12,
        gap: 12,
        position: 'relative',
    },
    navItemCollapsed: {
        justifyContent: 'center',
        paddingHorizontal: 0,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navLabel: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        letterSpacing: -0.1,
    },
    activeBar: {
        position: 'absolute',
        left: 0,
        top: '25%',
        bottom: '25%',
        width: 3,
        borderRadius: 2,
    },
    userFooter: {
        borderTopWidth: 1,
        paddingTop: 12,
        paddingHorizontal: 10,
    },
    userButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
        gap: 10,
    },
    userButtonCollapsed: {
        justifyContent: 'center',
        paddingHorizontal: 0,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'DMSans_600SemiBold',
    },
    userRole: {
        fontSize: 11,
        fontFamily: 'DMSans_400Regular',
        textTransform: 'capitalize',
        marginTop: 1,
    },
});
