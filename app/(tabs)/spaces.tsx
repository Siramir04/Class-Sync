import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useSpaces } from '../../hooks/useSpace';
import { useSpaceStore } from '../../store/spaceStore';
import Card from '../../components/ui/Card';
import Tag from '../../components/ui/Tag';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Space } from '../../types';

export default function SpacesScreen() {
    const router = useRouter();
    const { spaces, loading } = useSpaces();
    const { carryoverCourses } = useSpaceStore();

    const renderSpaceCard = ({ item }: { item: Space }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/space/${item.id}`)}
        >
            <Card style={styles.spaceCard}>
                <View style={styles.spaceCardHeader}>
                    <Text style={styles.spaceName}>{item.name}</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.border} />
                </View>
                <Text style={styles.spaceDept}>{item.department} · {item.programme}</Text>
                <View style={styles.spaceFooter}>
                    <Text style={styles.spaceCode}>{item.spaceCode}</Text>
                    <Text style={styles.memberCount}>
                        <Ionicons name="people-outline" size={14} color={Colors.textSecondary} /> {item.memberCount}
                    </Text>
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Spaces</Text>
            </View>

            {loading ? (
                <LoadingSpinner />
            ) : spaces.length > 0 ? (
                <FlatList
                    data={spaces}
                    renderItem={renderSpaceCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        carryoverCourses.length > 0 ? (
                            <View style={styles.carryoverSection}>
                                <View style={styles.carryoverHeader}>
                                    <View style={styles.carryoverDot} />
                                    <Text style={styles.carryoverTitle}>Carryover Courses</Text>
                                </View>
                                {carryoverCourses.map((course) => (
                                    <Card key={course.id} style={styles.carryoverCard}>
                                        <Text style={styles.carryoverCourseName}>{course.courseName}</Text>
                                        <View style={styles.carryoverRow}>
                                            <Text style={styles.carryoverCode}>{course.fullCode}</Text>
                                            <Tag label="Carryover" variant="carryover" />
                                        </View>
                                    </Card>
                                ))}
                            </View>
                        ) : null
                    }
                />
            ) : (
                <EmptyState
                    icon="🏫"
                    title="No spaces yet"
                    subtitle="Join or create a space to get started"
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/join')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={28} color={Colors.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerTitle: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
    },
    list: {
        padding: Spacing.screenPadding,
        paddingBottom: 100,
    },
    spaceCard: {
        marginBottom: Spacing.md,
    },
    spaceCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    spaceName: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        flex: 1,
    },
    spaceDept: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    spaceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    spaceCode: {
        ...Typography.codeDisplay,
        color: Colors.accentBlue,
    },
    memberCount: {
        ...Typography.label,
        color: Colors.textSecondary,
    },
    carryoverSection: {
        marginTop: Spacing.lg,
    },
    carryoverHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    carryoverDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.carryover,
        marginRight: Spacing.sm,
    },
    carryoverTitle: {
        ...Typography.sectionHeader,
        color: Colors.carryover,
    },
    carryoverCard: {
        marginBottom: Spacing.sm,
    },
    carryoverCourseName: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    carryoverRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    carryoverCode: {
        ...Typography.codeDisplay,
        color: Colors.carryover,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: Spacing.fabSize,
        height: Spacing.fabSize,
        borderRadius: Spacing.fabSize / 2,
        backgroundColor: Colors.accentBlue,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.accentBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
