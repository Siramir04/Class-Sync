import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

interface SpaceTileProps {
    name: string;
    isCarryover?: boolean;
    isAddButton?: boolean;
    onPress?: () => void;
}

export default function SpaceTile({
    name,
    isCarryover = false,
    isAddButton = false,
    onPress,
}: SpaceTileProps) {
    const initials = name
        .split(' ')
        .map((w) => w.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);

    if (isAddButton) {
        return (
            <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
                <View style={[styles.circle, styles.addCircle]}>
                    <Ionicons name="add" size={28} color={Colors.accentBlue} />
                </View>
                <Text style={styles.name} numberOfLines={1}>Add</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.circleWrapper}>
                <View style={[styles.circle, isCarryover && styles.carryoverCircle]}>
                    <Text style={styles.initials}>{initials}</Text>
                </View>
                {isCarryover && <View style={styles.carryoverDot} />}
            </View>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: Spacing.md,
        width: 64,
    },
    circleWrapper: {
        position: 'relative',
    },
    circle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primaryBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    carryoverCircle: {
        backgroundColor: Colors.carryover,
    },
    addCircle: {
        backgroundColor: Colors.subtleFill,
    },
    carryoverDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.carryover,
        borderWidth: 2,
        borderColor: Colors.background,
    },
    initials: {
        color: Colors.white,
        fontFamily: 'DMSans_700Bold',
        fontSize: 18,
    },
    name: {
        ...Typography.label,
        color: Colors.textSecondary,
        textAlign: 'center',
        fontSize: 10,
    },
});
