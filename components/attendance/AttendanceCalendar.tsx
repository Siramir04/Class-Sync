import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../../hooks/useTheme';
import { AttendanceDateEntry } from '../../types';

interface AttendanceCalendarProps {
    sessionDates: AttendanceDateEntry[];
}

export default function AttendanceCalendar({ sessionDates }: AttendanceCalendarProps) {
    const { colors: Colors, isDark } = useTheme();
    const themedStyles = styles(Colors);
    const markedDates = sessionDates.reduce((acc: any, entry) => {
        acc[entry.date] = {
            marked: true,
            dotColor: entry.isPresent ? Colors.success : Colors.error,
        };
        return acc;
    }, {});

    return (
        <View style={themedStyles.container}>
            <Calendar
                theme={{
                    backgroundColor: Colors.background,
                    calendarBackground: Colors.background,
                    textSectionTitleColor: Colors.textTertiary,
                    selectedDayBackgroundColor: Colors.primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: Colors.primary,
                    dayTextColor: Colors.textPrimary,
                    textDisabledColor: Colors.separator,
                    dotColor: Colors.primary,
                    selectedDotColor: '#ffffff',
                    arrowColor: Colors.primary,
                    disabledArrowColor: Colors.separator,
                    monthTextColor: Colors.textPrimary,
                    indicatorColor: Colors.primary,
                    textDayFontFamily: 'DMSans_400Regular',
                    textMonthFontFamily: 'DMSans_700Bold',
                    textDayHeaderFontFamily: 'DMSans_500Medium',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12,
                }}
                markedDates={markedDates}
            />
        </View>
    );
}

const styles = (Colors: any) => StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 16,
        padding: 8,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
});
