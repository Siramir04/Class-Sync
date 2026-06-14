import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';

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
    const { colors: Colors } = useTheme();
    const themedStyles = styles(Colors);
    const rate = totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 0;

    const getStatusColor = () => {
        if (rate >= 75) return Colors.success;
        if (rate >= 50) return Colors.warning;
        return Colors.error;
    };

    const statusColor = getStatusColor();

    return (
        <TouchableOpacity
            style={themedStyles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={themedStyles.leftInfo}>
                <Text style={themedStyles.name} numberOfLines={1}>{studentName}</Text>
                <Text style={themedStyles.username}>{username ? `@${username}` : ''}</Text>
            </View>

            <View style={themedStyles.rightInfo}>
                <View style={themedStyles.statsContainer}>
                    <Text style={themedStyles.fraction}>{attendedCount}/{totalSessions}</Text>
                    <View style={[themedStyles.badge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[themedStyles.percentage, { color: statusColor }]}>
                            {Math.round(rate)}%
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = (Colors: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.separator,
    },
    leftInfo: {
        flex: 1,
        marginRight: 12,
    },
    name: {
        fontSize: 15,
        fontFamily: Typography.family.bold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    username: {
        fontSize: 12,
        fontFamily: Typography.family.regular,
        color: Colors.textSecondary,
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
        color: Colors.textSecondary,
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
