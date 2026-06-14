import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/spacing';
import { Post } from '../../types';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';

interface DueSoonWidgetProps {
    deadlines: Post[];
    loading?: boolean;
}

export default function DueSoonWidget({ deadlines, loading }: DueSoonWidgetProps) {
    const { colors: Colors } = useTheme();
    const themedStyles = styles(Colors);
    const router = useRouter();

    if (loading && deadlines.length === 0) return null;
    if (deadlines.length === 0) return null;

    return (
        <View style={themedStyles.container}>
            <View style={themedStyles.header}>
                <Text style={themedStyles.title}>Due Soon</Text>
                <TouchableOpacity onPress={() => router.push('/tracker')}>
                    <Text style={themedStyles.seeAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={themedStyles.scrollContent}
            >
                {deadlines.map((item) => {
                    const isUrgent = item.dueDate && (item.dueDate.getTime() - Date.now() < 24 * 60 * 60 * 1000);
                    
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[themedStyles.card, isUrgent && themedStyles.urgentCard]}
                            onPress={() => router.push(`/post/${item.id}?spaceId=${item.spaceId}&courseId=${item.courseId}`)}
                            activeOpacity={0.8}
                        >
                            <View style={themedStyles.cardHeader}>
                                <View style={[themedStyles.typeIcon, { backgroundColor: isUrgent ? 'rgba(255,255,255,0.2)' : Colors.primary + '10' }]}>
                                    <Ionicons 
                                        name={item.type === 'test' ? 'clipboard' : 'document-text'} 
                                        size={16} 
                                        color={isUrgent ? '#FFFFFF' : Colors.primary} 
                                    />
                                </View>
                                <Text style={[themedStyles.courseCode, isUrgent && themedStyles.urgentText]}>{item.courseCode}</Text>
                            </View>
                            
                            <Text style={[themedStyles.itemTitle, isUrgent && themedStyles.urgentText]} numberOfLines={1}>
                                {item.title}
                            </Text>
                            
                            <View style={themedStyles.footer}>
                                <Ionicons 
                                    name="time-outline" 
                                    size={14} 
                                    color={isUrgent ? 'rgba(255,255,255,0.8)' : Colors.textTertiary} 
                                />
                                <Text style={[themedStyles.dueText, isUrgent && themedStyles.urgentTextSubtitle]}>
                                    {item.dueDate ? formatDistanceToNow(item.dueDate, { addSuffix: true }) : 'TBD'}
                                </Text>
                            </View>

                            {isUrgent && (
                                <View style={themedStyles.urgentBadge}>
                                    <Text style={themedStyles.urgentBadgeText}>URGENT</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = (Colors: any) => StyleSheet.create({
    container: {
        marginBottom: Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingHorizontal: Spacing.screenPadding,
        marginBottom: Spacing.md,
    },
    title: {
        ...Typography.title3,
        color: Colors.textPrimary,
    },
    seeAll: {
        ...Typography.footnote,
        color: Colors.primary,
        fontFamily: Typography.family.semiBold,
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
        borderColor: Colors.separator,
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
        fontFamily: Typography.family.bold,
        color: Colors.textSecondary,
    },
    itemTitle: {
        fontSize: 14,
        fontFamily: Typography.family.semiBold,
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
        fontFamily: Typography.family.medium,
        color: Colors.textTertiary,
    },
    urgentText: {
        color: '#FFFFFF',
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
        color: '#FFFFFF',
        fontSize: 8,
        fontFamily: Typography.family.bold,
    },
});
