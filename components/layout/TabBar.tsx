import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
        <View style={styles.container}>
            <BlurView intensity={Platform.OS === 'ios' ? 90 : 100} tint="light" style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Get Icon Name based on route
                    let iconName: any = 'home';
                    if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
                    else if (route.name === 'schedule') iconName = isFocused ? 'calendar' : 'calendar-outline';
                    else if (route.name === 'spaces') iconName = isFocused ? 'grid' : 'grid-outline';
                    else if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={(options as any).tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabItem}
                            activeOpacity={0.7}
                        >
                            <Ionicons 
                                name={iconName} 
                                size={22} 
                                color={isFocused ? Colors.primaryBlue : Colors.textSecondary} 
                            />
                            <Text style={[
                                styles.label, 
                                { color: isFocused ? Colors.primaryBlue : Colors.textSecondary }
                            ]}>
                                {typeof label === 'string' ? label : route.name}
                            </Text>
                            {isFocused && <View style={styles.indicator} />}
                        </TouchableOpacity>
                    );
                })}
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        width: width,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    tabBar: {
        flexDirection: 'row',
        height: 70,
        width: '100%',
        borderRadius: 35,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 10,
        fontFamily: 'DMSans_600SemiBold',
        marginTop: 4,
    },
    indicator: {
        position: 'absolute',
        bottom: 12,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primaryBlue,
    },
});
