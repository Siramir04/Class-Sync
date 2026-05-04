import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  Platform, 
  Dimensions, 
  Animated 
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const { width } = Dimensions.get('window');

/**
 * Material 3 (M3) Bottom Navigation Bar
 * Features the pill-shaped active indicator and smooth spring animations.
 */
export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.outerContainer}>
        <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
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

                return (
                    <TabItem
                        key={route.key}
                        route={route}
                        isFocused={isFocused}
                        onPress={onPress}
                        label={options.title || route.name}
                    />
                );
            })}
        </View>
    </View>
  );
}

interface TabItemProps {
    route: any;
    isFocused: boolean;
    onPress: () => void;
    label: string;
}

const TabItem = ({ route, isFocused, onPress, label }: TabItemProps) => {
    const animation = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(animation, {
            toValue: isFocused ? 1 : 0,
            useNativeDriver: false, // Color and width don't support native driver well for this specific pill effect
            friction: 8,
            tension: 50,
        }).start();
    }, [isFocused]);

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.92,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const indicatorWidth = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 64], // Width of the M3 pill
    });

    const indicatorOpacity = animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    // Icon Mapping
    let IconComponent;
    switch (route.name) {
        case 'index':
            IconComponent = LucideIcons.House;
            break;
        case 'schedule':
            IconComponent = LucideIcons.CalendarDays;
            break;
        case 'spaces':
            IconComponent = LucideIcons.LayoutGrid;
            break;
        case 'profile':
            IconComponent = LucideIcons.UserRound;
            break;
        default:
            IconComponent = LucideIcons.Circle;
    }

    const iconColor = isFocused ? Colors.onPrimaryContainer : Colors.onSurfaceVariant;

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.tabItem}
        >
            <Animated.View style={[styles.iconWrapper, { transform: [{ scale }] }]}>
                {/* M3 Active Indicator Pill */}
                <Animated.View
                    style={[
                        styles.activeIndicator,
                        {
                            width: indicatorWidth,
                            opacity: indicatorOpacity,
                        }
                    ]}
                />
                <IconComponent 
                    size={24}
                    color={iconColor}
                    strokeWidth={isFocused ? 2.5 : 2}
                />
            </Animated.View>
            <Text
                style={[
                    styles.label,
                    {
                        color: iconColor,
                        fontFamily: isFocused ? Typography.family.bold : Typography.family.medium,
                    }
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceVariant,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: Colors.background,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    height: 32,
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeIndicator: {
    position: 'absolute',
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryContainer,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: Typography.family.medium,
  },
});
