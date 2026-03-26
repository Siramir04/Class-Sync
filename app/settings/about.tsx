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

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoPlaceholder}>
                        <Ionicons name="sync" size={60} color="#FFFFFF" />
                    </View>
                    <Text style={styles.appName}>ClassSync</Text>
                    <Text style={styles.appVersion}>Version {version} ({build})</Text>
                </View>

                <View style={[styles.card, { marginTop: 40 }]}>
                    <Text style={styles.cardText}>
                        ClassSync is the ultimate companion for university students and class monitors. 
                        Streamline your academic life with real-time notifications, a collaborative 
                        schedule, and centralized course materials.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>CREDITS</Text>
                <View style={styles.card}>
                    <Text style={styles.creditLabel}>Developed by</Text>
                    <Text style={styles.creditValue}>ClassSync Team</Text>
                    
                    <View style={{ height: 16 }} />
                    
                    <Text style={styles.creditLabel}>Design</Text>
                    <Text style={styles.creditValue}>iOS Native Experience Pro</Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 ClassSync. All rights reserved.</Text>
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
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.separator,
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
        color: Colors.textPrimary,
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
        backgroundColor: Colors.accentBlue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        fontSize: 24,
        fontFamily: Typography.family.bold,
        color: Colors.textPrimary,
        marginTop: 16,
    },
    appVersion: {
        fontSize: 13,
        fontFamily: Typography.family.medium,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.separator,
    },
    cardText: {
        fontSize: 15,
        fontFamily: Typography.family.regular,
        color: Colors.textPrimary,
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: Typography.family.bold,
        color: Colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginTop: 32,
        marginBottom: 12,
        marginLeft: 4,
    },
    creditLabel: {
        fontSize: 12,
        fontFamily: Typography.family.medium,
        color: Colors.textSecondary,
    },
    creditValue: {
        fontSize: 15,
        fontFamily: Typography.family.semiBold,
        color: Colors.textPrimary,
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
        color: Colors.textSecondary,
    },
});
