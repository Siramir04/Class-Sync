import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { ReadReceipt } from '../../types';
import * as postService from '../../services/postService';
import ActionSheet from '../ui/ActionSheet';
import { Avatar } from '../ui/Avatar';
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
    const { colors: Colors, typography: Typography } = useTheme();
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
        <View style={[styles.receiptItem, { borderBottomColor: Colors.separator }]}>
            <Avatar firstName={item.fullName.split(' ')[0]} lastName={item.fullName.split(' ')[1] || ''} size="md" />
            <View style={styles.receiptInfo}>
                <Text style={[styles.memberName, { color: Colors.textPrimary, fontFamily: Typography.family.semiBold }]}>
                    {item.fullName}
                </Text>
                <Text style={[styles.readAt, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>
                    Read {format(item.readAt, 'MMM d, h:mm a')}
                </Text>
            </View>
            <LucideIcons.CheckCircle2 size={16} color={Colors.primary} />
        </View>
    );

    return (
        <ActionSheet visible={visible} onClose={onClose} title="Read Receipts">
            <View style={styles.container}>
                <View style={[styles.statsContainer, { backgroundColor: Colors.surfaceSecondary }]}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: Colors.textPrimary, fontFamily: Typography.family.extraBold }]}>
                            {receipts.length}
                        </Text>
                        <Text style={[styles.statLabel, { color: Colors.textTertiary, fontFamily: Typography.family.bold }]}>
                            READ
                        </Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: Colors.separator }]} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: Colors.textPrimary, fontFamily: Typography.family.extraBold }]}>
                            {Math.max(0, memberCount - receipts.length)}
                        </Text>
                        <Text style={[styles.statLabel, { color: Colors.textTertiary, fontFamily: Typography.family.bold }]}>
                            PENDING
                        </Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingBox}>
                      <LucideIcons.Loader2 size={24} color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={receipts}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.uid}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <LucideIcons.EyeOff size={44} color={Colors.textTertiary} />
                                <Text style={[styles.emptyTitle, { color: Colors.textPrimary, fontFamily: Typography.family.bold }]}>
                                    No one hasn't read it yet
                                </Text>
                                <Text style={[styles.emptySubtitle, { color: Colors.textSecondary, fontFamily: Typography.family.regular }]}>
                                    Receipts appear as members open the post.
                                </Text>
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
        height: 480,
    },
    statsContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 24,
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        marginHorizontal: 16,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    receiptItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
    },
    receiptInfo: {
        flex: 1,
        marginLeft: 14,
    },
    memberName: {
        fontSize: 15,
        fontWeight: '600',
    },
    readAt: {
        fontSize: 12,
        marginTop: 2,
    },
    loadingBox: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 6,
        paddingHorizontal: 40,
    },
});
