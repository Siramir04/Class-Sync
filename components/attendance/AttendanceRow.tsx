import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface AttendanceRowProps {
    username: string;
    studentName: string;
    attendedCount: number;
    totalSessions: number;
    onPress?: () => void;
}

export default function AttendanceRow({
    username,
    studentName,
    attendedCount,
    totalSessions,
    onPress
}: AttendanceRowProps) {
    const rate = totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 0;

    const getStatusColor = () => {
        if (rate >= 75) return Colors.success;
        if (rate >= 50) return Colors.warning;
        return Colors.error;
    };

    const statusColor = getStatusColor();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.leftInfo}>
                <Text style={styles.name} numberOfLines={1}>{studentName}</Text>
                <Text style={styles.username}>{username ? `@${username}` : ''}</Text>
            </View>

            <View style={styles.rightInfo}>
                <View style={styles.statsContainer}>
                    <Text style={styles.fraction}>{attendedCount}/{totalSessions}</Text>
                    <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.percentage, { color: statusColor }]}>
                            {Math.round(rate)}%
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    leftInfo: {
        flex: 1,
        marginRight: 12,
    },
    name: {
        fontSize: 15,
        fontFamily: Typography.family.bold,
        color: '#333',
        marginBottom: 2,
    },
    username: {
        fontSize: 12,
        fontFamily: Typography.family.regular,
        color: '#666',
    },
    rightInfo: {
        alignItems: 'flex-end',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fraction: {
        fontSize: 12,
        fontFamily: Typography.family.medium,
        color: '#666',
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        minWidth: 45,
        alignItems: 'center',
    },
    percentage: {
        fontSize: 12,
        fontFamily: Typography.family.bold,
    },
});
