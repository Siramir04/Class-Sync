import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
    const router = useRouter();
    const version = '2.1.0';
    const build = '105';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>About ClassSync</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoPlaceholder}>
                        <Ionicons name="sync" size={60} color={Colors.white} />
                    </View>
                    <Text style={styles.appName}>ClassSync</Text>
                    <Text style={styles.appVersion}>Version {version} ({build})</Text>
                </View>

                <View style={[styles.card, { marginTop: Spacing.xl }]}>
                    <Text style={styles.cardText}>
                        ClassSync is the ultimate companion for university students and class monitors. 
                        Streamline your academic life with real-time notifications, a collaborative 
                        schedule, and centralized course materials.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Credits</Text>
                <View style={styles.card}>
                    <Text style={styles.creditLabel}>Developed by</Text>
                    <Text style={styles.creditValue}>ClassSync Team</Text>
                    
                    <View style={{ height: 16 }} />
                    
                    <Text style={styles.creditLabel}>Design</Text>
                    <Text style={styles.creditValue}>iOS Native Experience</Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2025 ClassSync. All rights reserved.</Text>
                </View>
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
    logoContainer: {
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 24,
        backgroundColor: Colors.primaryBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        ...Typography.pageTitle,
        marginTop: Spacing.md,
        fontSize: 24,
    },
    appVersion: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border + '30',
    },
    cardText: {
        ...Typography.body,
        color: Colors.textPrimary,
        lineHeight: 22,
    },
    sectionTitle: {
        ...Typography.sectionHeader,
        color: Colors.textSecondary,
        marginTop: Spacing.xl,
        marginBottom: Spacing.md,
    },
    creditLabel: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
    creditValue: {
        ...Typography.body,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginTop: 2,
    },
    footer: {
        marginTop: Spacing.xxl,
        alignItems: 'center',
        paddingBottom: Spacing.xl,
    },
    footerText: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
});
