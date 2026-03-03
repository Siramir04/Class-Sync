import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors } from '../../constants/colors';
import { AttendanceDateEntry } from '../../types/attendance';

interface AttendanceCalendarProps {
    sessionDates: AttendanceDateEntry[];
}

export default function AttendanceCalendar({ sessionDates }: AttendanceCalendarProps) {
    const markedDates = sessionDates.reduce((acc: any, entry) => {
        acc[entry.date] = {
            marked: true,
            dotColor: entry.isPresent ? Colors.success : Colors.error,
        };
        return acc;
    }, {});

    return (
        <View style={styles.container}>
            <Calendar
                theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: Colors.primaryBlue,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: Colors.primaryBlue,
                    dayTextColor: '#2d4150',
                    textDisabledColor: '#d9e1e8',
                    dotColor: Colors.primaryBlue,
                    selectedDotColor: '#ffffff',
                    arrowColor: Colors.primaryBlue,
                    disabledArrowColor: '#d9e1e8',
                    monthTextColor: Colors.primaryBlue,
                    indicatorColor: Colors.primaryBlue,
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

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
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
