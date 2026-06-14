import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';

interface AttendanceRateCardProps {
    rate: number;
    attended: number;
    total: number;
}

export default function AttendanceRateCard({ rate, attended, total }: AttendanceRateCardProps) {
    const { colors: Colors } = useTheme();
    const themedStyles = styles(Colors);
    const getStatusColor = () => {
        if (rate >= 75) return Colors.success;
        if (rate >= 50) return Colors.warning;
        return Colors.error;
    };

    const statusColor = getStatusColor();

    return (
        <View style={[themedStyles.container, { borderLeftColor: statusColor }]}>
            <View style={themedStyles.content}>
                <View>
                    <Text style={themedStyles.label}>Attendance Rate</Text>
                    <Text style={themedStyles.stats}>{attended} of {total} classes</Text>
                </View>
                <Text style={[themedStyles.percentage, { color: statusColor }]}>
                    {Math.round(rate)}%
                </Text>
            </View>
            <View style={themedStyles.progressBarBg}>
                <View
                    style={[
                        themedStyles.progressBarFill,
                        { width: `${Math.min(rate, 100)}%`, backgroundColor: statusColor }
                    ]}
                />
            </View>
        </View>
    );
}

const styles = (Colors: any) => StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
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
        ...Typography.footnote,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    stats: {
        ...Typography.title3,
        color: Colors.textPrimary,
    },
    percentage: {
        ...Typography.largeTitle,
        fontSize: 32,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: Colors.separator,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
});
