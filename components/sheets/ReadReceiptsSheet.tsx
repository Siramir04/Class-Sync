import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';
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
            <Avatar firstName={item.fullName.split(' ')[0]} lastName={item.fullName.split(' ')[1] || ''} size="md" />
            <View style={styles.receiptInfo}>
                <Text style={styles.memberName}>{item.fullName}</Text>
                <Text style={styles.readAt}>
                    Read {format(item.readAt, 'MMM d, h:mm a')}
                </Text>
            </View>
            <LucideIcons.CheckCircle2 size={16} color={Colors.accentBlue} />
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
                        <Text style={styles.statLabel}>PENDING</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingBox}>
                      <LucideIcons.Loader2 size={24} color={Colors.accentBlue} style={styles.spin} />
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
                                <LucideIcons.EyeOff size={44} color={Colors.separatorOpaque} />
                                <Text style={styles.emptyTitle}>No one hasn't read it yet</Text>
                                <Text style={styles.emptySubtitle}>Receipts appear as members open the post.</Text>
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
        backgroundColor: '#F9F9FB',
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
        color: '#000',
        fontFamily: Typography.family.extraBold,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textTertiary,
        marginTop: 2,
        fontFamily: Typography.family.bold,
    },
    statDivider: {
        width: 1,
        backgroundColor: Colors.separator,
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
        borderBottomColor: Colors.separator,
    },
    receiptInfo: {
        flex: 1,
        marginLeft: 14,
    },
    memberName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        fontFamily: Typography.family.semiBold,
    },
    readAt: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginTop: 2,
        fontFamily: Typography.family.regular,
    },
    loadingBox: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    spin: {
      // Logic for spinning would usually be an animated component, but for a placeholder:
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#000',
        marginTop: 16,
        fontFamily: Typography.family.bold,
    },
    emptySubtitle: {
        fontSize: 13,
        color: Colors.textTertiary,
        textAlign: 'center',
        marginTop: 6,
        paddingHorizontal: 40,
        fontFamily: Typography.family.regular,
    },
});
