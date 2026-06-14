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
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
import { useResponsive } from '../../hooks/useResponsive';

const { width } = Dimensions.get('window');

/**
 * Bottom Navigation Bar — Teal design system
 * Hidden on desktop web — DesktopSidebar takes over navigation.
 */
export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors: Colors } = useTheme();
  const { isDesktop } = useResponsive();

  // On desktop web, hide the bottom tab bar (DesktopSidebar handles nav)
  if (Platform.OS === 'web' && isDesktop) {
    return null;
  }
  return (
    <View style={[tabStyles.outerContainer, { 
      backgroundColor: Colors.surface,
      borderTopColor: Colors.borderSubtle,
    }]}>
        <View style={[tabStyles.tabBar, { backgroundColor: Colors.surface }]}>
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
    const { colors: Colors, typography: Typo } = useTheme();
    const animation = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(animation, {
            toValue: isFocused ? 1 : 0,
            useNativeDriver: false,
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
        outputRange: [0, 64],
    });

    const indicatorOpacity = animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    // Icon Mapping
    let IconComponent;
    switch (route.name) {
        case 'index':
            IconComponent = LucideIcons.LayoutGrid;
            break;
        case 'schedule':
            IconComponent = LucideIcons.CalendarDays;
            break;
        case 'spaces':
            IconComponent = LucideIcons.Layers;
            break;
        case 'profile':
            IconComponent = LucideIcons.UserRound;
            break;
        default:
            IconComponent = LucideIcons.Circle;
    }

    const iconColor = isFocused ? Colors.primary : Colors.textTertiary;

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={tabStyles.tabItem}
        >
            <Animated.View style={[tabStyles.iconWrapper, { transform: [{ scale }] }]}>
                {/* Active Indicator Pill */}
                <Animated.View
                    style={[
                        tabStyles.activeIndicator,
                        {
                            width: indicatorWidth,
                            opacity: indicatorOpacity,
                            backgroundColor: Colors.accentSecondary + '20',
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
                    tabStyles.label,
                    {
                        color: iconColor,
                        fontFamily: isFocused ? Typo.family.bold : Typo.family.medium,
                    }
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
};

const tabStyles = StyleSheet.create({
  outerContainer: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 44, // 44px minimum touch target
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
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});
