import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { ReadReceipt } from '../../types';
import * as postService from '../../services/postService';
import ActionSheet from '../ui/ActionSheet';
import LoadingSpinner from '../ui/LoadingSpinner';
import Avatar from '../ui/Avatar';
import { format } from 'date-fns';

interface ReadReceiptsSheetProps {
    visible: boolean;
    onClose: () => void;
    postId: string;
    spaceId: string;
    courseId: string;
    memberCount: number;
}

export default function ReadReceiptsSheet({
    visible,
    onClose,
    postId,
    spaceId,
    courseId,
    memberCount,
}: ReadReceiptsSheetProps) {
    const [receipts, setReceipts] = useState<ReadReceipt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            loadReceipts();
        }
    }, [visible]);

    const loadReceipts = async () => {
        setLoading(true);
        try {
            const data = await postService.getReadReceipts(spaceId, courseId, postId);
            setReceipts(data);
        } catch (error) {
            console.error('Error loading receipts:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: ReadReceipt }) => (
        <View style={styles.receiptItem}>
            <Avatar name={item.fullName} size={36} />
            <View style={styles.receiptInfo}>
                <Text style={styles.memberName}>{item.fullName}</Text>
                <Text style={styles.readAt}>
                    Read {format(item.readAt, 'MMM d, h:mm a')}
                </Text>
            </View>
            <Ionicons name="checkmark-done" size={16} color={Colors.accentBlue} />
        </View>
    );

    return (
        <ActionSheet visible={visible} onClose={onClose} title="Read Receipts">
            <View style={styles.container}>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{receipts.length}</Text>
                        <Text style={styles.statLabel}>READ</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{Math.max(0, memberCount - receipts.length)}</Text>
                        <Text style={styles.statLabel}>UNREAD</Text>
                    </View>
                </View>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <FlatList
                        data={receipts}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.uid}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="eye-off-outline" size={48} color={Colors.textTertiary} />
                                <Text style={styles.emptyTitle}>No one hasn't read it yet</Text>
                                <Text style={styles.emptySubtitle}>Receipts will appear here as members view the post.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </ActionSheet>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 400,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.subtleFill,
        borderRadius: 16,
        padding: 16,
        margin: Spacing.screenPadding,
        marginBottom: 8,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
        color: Colors.textTertiary,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: Colors.border + '20',
        marginHorizontal: 16,
    },
    listContent: {
        paddingHorizontal: Spacing.screenPadding,
        paddingBottom: 20,
    },
    receiptItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border + '10',
    },
    receiptInfo: {
        flex: 1,
        marginLeft: 12,
    },
    memberName: {
        fontSize: 15,
        fontFamily: 'DMSans_600SemiBold',
        color: Colors.textPrimary,
    },
    readAt: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: Colors.textTertiary,
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        ...Typography.subHeader,
        color: Colors.textPrimary,
        marginTop: 16,
    },
    emptySubtitle: {
        ...Typography.bodySmall,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
});
