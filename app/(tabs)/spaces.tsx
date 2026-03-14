import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Platform,
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

    const renderSpaceCard = ({ item }: { item: Space }) => {
        const initials = item.name
            .split(' ')
            .map((w) => w.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/space/${item.id}`)}
                style={styles.cardContainer}
            >
                <Card style={styles.spaceCard}>
                    <View style={styles.cardMain}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.initials}>{initials}</Text>
                        </View>
                        <View style={styles.info}>
                            <View style={styles.titleRow}>
                                <Text style={styles.spaceName} numberOfLines={1}>{item.name}</Text>
                                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                            </View>
                            <Text style={styles.spaceDept} numberOfLines={1}>
                                {item.department} · {item.programme}
                            </Text>
                            <View style={styles.metaRow}>
                                <View style={styles.metaBadge}>
                                    <Text style={styles.metaBadgeText}>{item.spaceCode}</Text>
                                </View>
                                <View style={styles.memberInfo}>
                                    <Ionicons name="people-outline" size={14} color={Colors.textTertiary} />
                                    <Text style={styles.memberCount}>{item.memberCount} members</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Spaces</Text>
                    <Text style={styles.subtitle}>{spaces.length} active communities</Text>
                </View>
                <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => router.push('/join')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={26} color={Colors.primaryBlue} />
                </TouchableOpacity>
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
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Carryover Courses</Text>
                                </View>
                                {carryoverCourses.map((course) => (
                                    <Card key={course.id} style={styles.carryoverCard}>
                                        <View style={styles.carryoverContent}>
                                            <View style={styles.carryoverInfo}>
                                                <Text style={styles.carryoverName}>{course.courseName}</Text>
                                                <Text style={styles.carryoverCode}>{course.fullCode}</Text>
                                            </View>
                                            <Tag label="CARRYOVER" variant="carryover" />
                                        </View>
                                    </Card>
                                ))}
                            </View>
                        ) : (
                                <View style={{ height: 120 }} />
                        )
                    }
                />
            ) : (
                <EmptyState
                    icon="apps-outline"
                    title="No spaces found"
                    subtitle="You haven't joined any university spaces yet. Use the '+' button to get started."
                />
            )}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPadding,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        marginBottom: Spacing.lg,
    },
    headerTitle: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
    },
    subtitle: {
        ...Typography.label,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    list: {
        paddingHorizontal: Spacing.screenPadding,
        paddingBottom: 100,
    },
    cardContainer: {
        marginBottom: 12,
    },
    spaceCard: {
        padding: 0,
        overflow: 'hidden',
    },
    cardMain: {
        flexDirection: 'row',
        padding: 12,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: Colors.primaryBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    initials: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: Colors.white,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    spaceName: {
        fontSize: 17,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    spaceDept: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaBadge: {
        backgroundColor: Colors.primaryBlue + '10',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    metaBadgeText: {
        fontSize: 11,
        fontFamily: 'DMSans_700Bold',
        color: Colors.primaryBlue,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    memberCount: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textTertiary,
    },
    carryoverSection: {
        marginTop: 24,
        marginBottom: 40,
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        fontSize: 18,
    },
    carryoverCard: {
        marginBottom: 10,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.carryover,
    },
    carryoverContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    carryoverInfo: {
        flex: 1,
    },
    carryoverName: {
        fontSize: 16,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    carryoverCode: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textSecondary,
    },
});
