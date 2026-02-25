import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import Button from '../ui/Button';

interface CourseAcceptSheetProps {
    visible: boolean;
    courseCode: string;
    courseName: string;
    daysRemaining: number;
    onAccept: () => void;
    onDismiss: () => void;
}

export default function CourseAcceptSheet({
    visible,
    courseCode,
    courseName,
    daysRemaining,
    onAccept,
    onDismiss,
}: CourseAcceptSheetProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onDismiss}
        >
            <Pressable style={styles.overlay} onPress={onDismiss}>
                <Pressable style={styles.sheet} onPress={() => { }}>
                    <View style={styles.handle} />
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🔔</Text>
                    </View>
                    <Text style={styles.title}>New Course Added</Text>
                    <Text style={styles.courseCode}>{courseCode}</Text>
                    <Text style={styles.courseName}>{courseName}</Text>
                    <Text style={styles.description}>
                        This course will be automatically added to your Space in{' '}
                        <Text style={styles.bold}>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</Text>.
                        You can accept it now or let it auto-add.
                    </Text>
                    <Button title="Accept Now" onPress={onAccept} style={styles.acceptBtn} />
                    <Button
                        title="Let it auto-add"
                        onPress={onDismiss}
                        variant="ghost"
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
        alignItems: 'center',
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: Colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: Spacing.lg,
    },
    iconContainer: {
        marginBottom: Spacing.md,
    },
    icon: {
        fontSize: 48,
    },
    title: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    courseCode: {
        ...Typography.codeDisplay,
        color: Colors.accentBlue,
        marginBottom: Spacing.xs,
    },
    courseName: {
        ...Typography.sectionHeader,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    description: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.lg,
    },
    bold: {
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    acceptBtn: {
        marginBottom: Spacing.sm,
    },
});
