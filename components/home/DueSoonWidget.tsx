import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Post } from '../../types';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';

interface DueSoonWidgetProps {
    deadlines: Post[];
    loading?: boolean;
}

export default function DueSoonWidget({ deadlines, loading }: DueSoonWidgetProps) {
    const router = useRouter();

    if (loading && deadlines.length === 0) return null;
    if (deadlines.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Due Soon</Text>
                <TouchableOpacity onPress={() => router.push('/tracker')}>
                    <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {deadlines.map((item) => {
                    const isUrgent = item.dueDate && (item.dueDate.getTime() - Date.now() < 24 * 60 * 60 * 1000);
                    
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.card, isUrgent && styles.urgentCard]}
                            onPress={() => router.push(`/post/${item.id}?spaceId=${item.spaceId}&courseId=${item.courseId}`)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.typeIcon, { backgroundColor: isUrgent ? Colors.white + '20' : Colors.primaryBlue + '10' }]}>
                                    <Ionicons 
                                        name={item.type === 'test' ? 'clipboard' : 'document-text'} 
                                        size={16} 
                                        color={isUrgent ? Colors.white : Colors.primaryBlue} 
                                    />
                                </View>
                                <Text style={[styles.courseCode, isUrgent && styles.urgentText]}>{item.courseCode}</Text>
                            </View>
                            
                            <Text style={[styles.itemTitle, isUrgent && styles.urgentText]} numberOfLines={1}>
                                {item.title}
                            </Text>
                            
                            <View style={styles.footer}>
                                <Ionicons 
                                    name="time-outline" 
                                    size={14} 
                                    color={isUrgent ? Colors.white + '80' : Colors.textTertiary} 
                                />
                                <Text style={[styles.dueText, isUrgent && styles.urgentTextSubtitle]}>
                                    {item.dueDate ? formatDistanceToNow(item.dueDate, { addSuffix: true }) : 'TBD'}
                                </Text>
                            </View>

                            {isUrgent && (
                                <View style={styles.urgentBadge}>
                                    <Text style={styles.urgentBadgeText}>URGENT</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingHorizontal: Spacing.screenPadding,
        marginBottom: Spacing.md,
    },
    title: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
    },
    seeAll: {
        ...Typography.bodySmall,
        color: Colors.primaryBlue,
        fontWeight: '600',
    },
    scrollContent: {
        paddingLeft: Spacing.screenPadding,
        paddingRight: Spacing.screenPadding,
        gap: 12,
    },
    card: {
        width: 160,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border + '15',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    urgentCard: {
        backgroundColor: Colors.error,
        borderColor: Colors.error,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    courseCode: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textSecondary,
    },
    itemTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dueText: {
        fontSize: 11,
        fontFamily: 'DMSans_500Medium',
        color: Colors.textTertiary,
    },
    urgentText: {
        color: Colors.white,
    },
    urgentTextSubtitle: {
        color: 'rgba(255,255,255,0.8)',
    },
    urgentBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    urgentBadgeText: {
        color: Colors.white,
        fontSize: 8,
        fontFamily: 'DMSans_700Bold',
    },
});
