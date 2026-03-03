import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface AttendanceRateCardProps {
    rate: number;
    attended: number;
    total: number;
}

export default function AttendanceRateCard({ rate, attended, total }: AttendanceRateCardProps) {
    const getStatusColor = () => {
        if (rate >= 75) return Colors.success;
        if (rate >= 50) return Colors.warning;
        return Colors.error;
    };

    const statusColor = getStatusColor();

    return (
        <View style={[styles.container, { borderLeftColor: statusColor }]}>
            <View style={styles.content}>
                <View>
                    <Text style={styles.label}>Attendance Rate</Text>
                    <Text style={styles.stats}>{attended} of {total} classes</Text>
                </View>
                <Text style={[styles.percentage, { color: statusColor }]}>
                    {Math.round(rate)}%
                </Text>
            </View>
            <View style={styles.progressBarBg}>
                <View
                    style={[
                        styles.progressBarFill,
                        { width: `${Math.min(rate, 100)}%`, backgroundColor: statusColor }
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        borderLeftWidth: 4,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        ...Typography.label,
        color: '#666',
        marginBottom: 4,
    },
    stats: {
        ...Typography.sectionHeader,
        color: '#333',
    },
    percentage: {
        ...Typography.display,
        fontSize: 32,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
});
