import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

/**
 * TabBar is handled by Expo Router's built-in Tabs component.
 * This file is kept as a placeholder for any custom tab bar overrides.
 */
export default function TabBar() {
    return <View style={styles.container} />;
}

const styles = StyleSheet.create({
    container: {
        height: Spacing.tabBarHeight,
        backgroundColor: Colors.surface,
    },
});
