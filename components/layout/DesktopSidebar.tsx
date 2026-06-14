// components/layout/DesktopSidebar.tsx
// Deep teal sidebar with vertical icon layouts and liquid blob hover animations
import React, { useRef } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Image,
    Animated,
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
    { label: 'Dashboard', icon: 'LayoutGrid', route: '/(tabs)', segment: '(tabs)' },
    { label: 'Schedule', icon: 'CalendarDays', route: '/(tabs)/schedule', segment: 'schedule' },
    { label: 'Spaces', icon: 'Layers', route: '/(tabs)/spaces', segment: 'spaces' },
    { label: 'Profile', icon: 'UserRound', route: '/(tabs)/profile', segment: 'profile' },
];

const BOTTOM_ITEMS: NavItem[] = [
    { label: 'Settings', icon: 'Settings', route: '/settings/about', segment: 'settings' },
];

const SIDEBAR_WIDTH = 84;

/** Animated nav item with vertical stack and liquid blob hover/active container */
function SidebarNavItem({
    item,
    active,
    onPress,
    sidebarColors,
    bgSidebarColor,
}: {
    item: NavItem;
    active: boolean;
    onPress: () => void;
    sidebarColors: { text: string; activeText: string; hoverBg: string };
    bgSidebarColor: string;
}) {
    const blobScale = useRef(new Animated.Value(active ? 1 : 0)).current;
    const blobOpacity = useRef(new Animated.Value(active ? 1 : 0)).current;
    const IconComponent = LucideIcons[item.icon] as React.ComponentType<any>;

    const handleHoverIn = () => {
        if (!active) {
            Animated.parallel([
                Animated.spring(blobScale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }),
                Animated.timing(blobOpacity, { toValue: 0.15, duration: 150, useNativeDriver: true }),
            ]).start();
        }
    };

    const handleHoverOut = () => {
        if (!active) {
            Animated.parallel([
                Animated.spring(blobScale, { toValue: 0, useNativeDriver: true, friction: 8 }),
                Animated.timing(blobOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
            ]).start();
        }
    };

    // Animate active state morphing
    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(blobScale, { toValue: active ? 1 : 0, useNativeDriver: true, friction: 8 }),
            Animated.timing(blobOpacity, { toValue: active ? 1 : 0, duration: 200, useNativeDriver: true }),
        ]).start();
    }, [active]);

    // Icon color: when active, it matches the sidebar's dark teal background. When inactive, it's white/semi-transparent.
    const iconColor = active ? bgSidebarColor : sidebarColors.text;

    return (
        <Pressable
            onPress={onPress}
            // @ts-ignore — web-only hover events
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
            style={({ pressed }: any) => [
                styles.navItem,
                pressed && { opacity: 0.8 },
            ]}
        >
            {/* Centered Icon container */}
            <View style={styles.iconContainer}>
                {/* Liquid blob background */}
                <Animated.View
                    style={[
                        styles.liquidBlob,
                        {
                            backgroundColor: active ? '#FFFFFF' : sidebarColors.hoverBg,
                            opacity: active ? 1 : blobOpacity,
                            transform: [{ scale: blobScale }],
                        },
                    ]}
                />
                <IconComponent
                    size={20}
                    color={iconColor}
                    strokeWidth={active ? 2.5 : 1.8}
                />
            </View>

            {/* Label text directly below the icon */}
            <Text
                style={[
                    styles.navLabel,
                    {
                        color: active ? sidebarColors.activeText : sidebarColors.text,
                        fontWeight: active ? '700' : '500',
                    },
                ]}
                numberOfLines={1}
            >
                {item.label}
            </Text>
        </Pressable>
    );
}

export default function DesktopSidebar() {
    const { colors, toggleTheme, themeMode } = useTheme();
    const router = useRouter();
    const segments = useSegments() as string[];
    const { user } = useAuthStore();

    const firstName = user?.fullName?.split(' ')[0] || 'User';
    const lastName = user?.fullName?.split(' ')[1] || '';

    // Sidebar colors (light colors/white text against deep teal background)
    const sidebarColors = {
        text: 'rgba(255,255,255,0.7)',
        activeText: '#FFFFFF',
        hoverBg: 'rgba(255,255,255,0.2)',
    };

    const isActive = (item: NavItem): boolean => {
        const currentSegment = segments[0] || '';
        const secondSegment = segments[1] || '';

        // Dashboard: active when on (tabs) root
        if (item.segment === '(tabs)') {
            return currentSegment === '(tabs)' && (!secondSegment || secondSegment === 'index');
        }
        // Settings
        if (item.segment === 'settings') {
            return currentSegment === 'settings';
        }
        // Others: match second segment
        return currentSegment === '(tabs)' && secondSegment === item.segment;
    };

    const handleNav = (route: string) => {
        router.push(route as any);
    };

    const themeIcon = themeMode === 'system' ? 'Monitor' : themeMode === 'dark' ? 'Moon' : 'Sun';
    const themeLabel = themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light';

    return (
        <View
            style={[
                styles.container,
                {
                    width: SIDEBAR_WIDTH,
                    backgroundColor: colors.bgSidebar,
                },
            ]}
        >
            {/* Branding - centered logo with no text label */}
            <View style={styles.brandingContainer}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* Main Navigation - Vertically Stacked */}
            <View style={styles.navContainer}>
                {NAV_ITEMS.map((item) => (
                    <SidebarNavItem
                        key={item.route}
                        item={item}
                        active={isActive(item)}
                        onPress={() => handleNav(item.route)}
                        sidebarColors={sidebarColors}
                        bgSidebarColor={colors.bgSidebar}
                    />
                ))}
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Bottom Items & Theme Toggle */}
            <View style={styles.bottomSection}>
                {BOTTOM_ITEMS.map((item) => (
                    <SidebarNavItem
                        key={item.route}
                        item={item}
                        active={isActive(item)}
                        onPress={() => handleNav(item.route)}
                        sidebarColors={sidebarColors}
                        bgSidebarColor={colors.bgSidebar}
                    />
                ))}

                {/* Dark Mode Toggle as a vertical navigation item */}
                <Pressable
                    onPress={toggleTheme}
                    style={({ pressed }: any) => [
                        styles.navItem,
                        pressed && { opacity: 0.8 },
                    ]}
                >
                    <View style={styles.iconContainer}>
                        {React.createElement(
                            LucideIcons[themeIcon] as React.ComponentType<any>,
                            { size: 20, color: sidebarColors.text, strokeWidth: 1.8 }
                        )}
                    </View>
                    <Text
                        style={[styles.navLabel, { color: sidebarColors.text }]}
                        numberOfLines={1}
                    >
                        {themeLabel}
                    </Text>
                </Pressable>
            </View>

            {/* User footer - Centered Avatar Button */}
            <View style={styles.userFooter}>
                <Pressable
                    onPress={() => handleNav('/(tabs)/profile')}
                    style={({ pressed }: any) => [
                        styles.userButton,
                        pressed && { opacity: 0.85 },
                    ]}
                >
                    <Avatar firstName={firstName} lastName={lastName} size="md" />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        paddingTop: 24,
        paddingBottom: 16,
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
    },
    brandingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    logo: {
        width: 38,
        height: 38,
        borderRadius: 10,
    },
    navContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    navItem: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    liquidBlob: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 12,
    },
    navLabel: {
        fontSize: 10,
        fontFamily: 'DMSans_500Medium',
        marginTop: 6,
        letterSpacing: -0.1,
    },
    separator: {
        height: 1,
        width: '60%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 14,
    },
    bottomSection: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    userFooter: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 16,
        width: '70%',
        alignItems: 'center',
        marginTop: 14,
    },
    userButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
