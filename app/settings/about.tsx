import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/spacing';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
    const router = useRouter();
    const { colors: Colors, typography: Typography } = useTheme();
    const version = '2.1.0';
    const build = '105';

    const themedStyles = styles(Colors, Typography);

    return (
        <SafeAreaView style={themedStyles.container}>
            <View style={themedStyles.header}>
                <TouchableOpacity onPress={() => router.back()} style={themedStyles.headerButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.onSurface} />
                </TouchableOpacity>
                <Text style={themedStyles.title}>About ClassSync</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={themedStyles.content} showsVerticalScrollIndicator={false}>
                <View style={themedStyles.logoContainer}>
                    <View style={themedStyles.logoPlaceholder}>
                        <Ionicons name="sync" size={60} color="#FFFFFF" />
                    </View>
                    <Text style={themedStyles.appName}>ClassSync</Text>
                    <Text style={themedStyles.appVersion}>Version {version} ({build})</Text>
                </View>

                <View style={[themedStyles.card, { marginTop: 40 }]}>
                    <Text style={themedStyles.cardText}>
                        ClassSync is the ultimate companion for university students and class monitors. 
                        Streamline your academic life with real-time notifications, a collaborative 
                        schedule, and centralized course materials.
                    </Text>
                </View>

                <Text style={themedStyles.sectionTitle}>CREDITS</Text>
                <View style={themedStyles.card}>
                    <Text style={themedStyles.creditLabel}>Developed by</Text>
                    <Text style={themedStyles.creditValue}>ClassSync Team</Text>
                    
                    <View style={{ height: 16 }} />
                    
                    <Text style={themedStyles.creditLabel}>Design</Text>
                    <Text style={themedStyles.creditValue}>iOS Native Experience Pro</Text>
                </View>

                <View style={themedStyles.footer}>
                    <Text style={themedStyles.footerText}>© 2026 ClassSync. All rights reserved.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = (Colors: any, Typography: any) => StyleSheet.create({
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
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.outlineVariant,
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
        padding: Spacing.screenPadding,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        fontSize: 24,
        fontFamily: Typography.family.bold,
        color: Colors.onSurface,
        marginTop: 16,
    },
    appVersion: {
        fontSize: 13,
        fontFamily: Typography.family.medium,
        color: Colors.onSurfaceVariant,
        marginTop: 4,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.outlineVariant,
    },
    cardText: {
        fontSize: 15,
        fontFamily: Typography.family.regular,
        color: Colors.onSurface,
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: Typography.family.bold,
        color: Colors.onSurfaceVariant,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginTop: 32,
        marginBottom: 12,
        marginLeft: 4,
    },
    creditLabel: {
        fontSize: 12,
        fontFamily: Typography.family.medium,
        color: Colors.onSurfaceVariant,
    },
    creditValue: {
        fontSize: 15,
        fontFamily: Typography.family.semiBold,
        color: Colors.onSurface,
        marginTop: 2,
    },
    footer: {
        marginTop: 60,
        alignItems: 'center',
        paddingBottom: 40,
    },
    footerText: {
        fontSize: 12,
        fontFamily: Typography.family.regular,
        color: Colors.onSurfaceVariant,
    },
});
