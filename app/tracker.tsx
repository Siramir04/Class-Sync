import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { useTracker } from '../hooks/useTracker';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import PostCard from '../components/cards/PostCard';
import { format, isToday, isThisWeek, isAfter, addWeeks } from 'date-fns';

export default function TrackerScreen() {
    const router = useRouter();
    const { deadlines, loading } = useTracker();

    const sections = useMemo(() => {
        const today: any[] = [];
        const thisWeek: any[] = [];
        const later: any[] = [];

        deadlines.forEach(item => {
            if (!item.dueDate) return;
            if (isToday(item.dueDate)) {
                today.push(item);
            } else if (isThisWeek(item.dueDate) && isAfter(item.dueDate, new Date())) {
                thisWeek.push(item);
            } else {
                later.push(item);
            }
        });

        return [
            { title: 'Due Today', data: today },
            { title: 'This Week', data: thisWeek },
            { title: 'Upcoming', data: later },
        ].filter(s => s.data.length > 0);
    }, [deadlines]);

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Assignment Tracker</Text>
                <View style={{ width: 44 }} />
            </View>

            {deadlines.length > 0 ? (
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {sections.map((section) => (
                        <View key={section.title} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            {section.data.map((item) => (
                                <PostCard
                                    key={item.id}
                                    post={item}
                                    style={styles.card}
                                    onPress={() => router.push(`/post/${item.id}?spaceId=${item.spaceId}&courseId=${item.courseId}`)}
                                />
                            ))}
                        </View>
                    ))}
                    <View style={{ height: 40 }} />
                </ScrollView>
            ) : (
                <EmptyState
                    icon="calendar-outline"
                    title="All caught up!"
                    subtitle="No upcoming assignments or tests found. Enjoy your free time!"
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
        alignItems: 'center',
        paddingHorizontal: 8,
        height: 56,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '15',
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    scrollContent: {
        padding: Spacing.screenPadding,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        ...Typography.subHeader,
        color: Colors.textSecondary,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: 12,
    },
    card: {
        marginBottom: 12,
    },
});
