import React, { useRef } from 'react';
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
import { BlurView } from 'expo-blur';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

const { width } = Dimensions.get('window');

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <BlurView 
        intensity={Platform.OS === 'ios' ? 90 : 100} 
        tint="dark" // Using dark for the transparent/glossy look requested with white icons
        style={styles.tabBar}
      >
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

          const scaleAnim = useRef(new Animated.Value(1)).current;

          const handlePressIn = () => {
            Animated.spring(scaleAnim, {
              toValue: 0.9,
              useNativeDriver: true,
            }).start();
          };

          const handlePressOut = () => {
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
          };

          // Icon Mapping
          let IconComponent;
          let iconProps = {
            size: 24,
            color: 'white',
            style: { opacity: isFocused ? 1 : 0.45 }
          };

          switch (route.name) {
            case 'index':
              IconComponent = isFocused ? LucideIcons.House : LucideIcons.House;
              // Lucide House doesn't have a specific "filled" variant like Ionicons, 
              // but we can use absolute stroke or fill if available. 
              // React Native Lucide usually supports 'fill'.
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

          return (
            <Pressable
              key={index}
              onPress={onPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.tabItem}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
                <IconComponent 
                  {...iconProps} 
                  fill={isFocused && route.name === 'index' ? 'white' : 'transparent'}
                />
                {isFocused && <View style={styles.indicator} />}
              </Animated.View>
            </Pressable>
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
    height: Spacing.tabBarHeight,
    width: '100%',
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 60, 110, 0.8)', // Semi-transparent primaryNavy for glossy look
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    marginTop: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
  },
});
