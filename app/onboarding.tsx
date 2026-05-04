import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import * as LucideIcons from 'lucide-react-native';
import { Button } from '../components/ui/Button';

const { width, height } = Dimensions.get('window');

interface Slide {
  icon: keyof typeof LucideIcons;
  headline: string;
  body: string;
  color: string;
  containerColor: string;
}

const slides: Slide[] = [
  {
    icon: 'Bell',
    headline: "Never miss\na class.",
    body: "Get instant notifications for lectures, assignments, and cancellations the moment they're posted.",
    color: Colors.primary,
    containerColor: Colors.primaryContainer,
  },
  {
    icon: 'LayoutGrid',
    headline: "One Space\nfor your class.",
    body: "Your Monitor creates a Space for your level. Join once and stay connected to every course automatically.",
    color: Colors.secondary,
    containerColor: Colors.secondaryContainer,
  },
  {
    icon: 'Users',
    headline: "Your class,\nalways in sync.",
    body: "Schedules, announcements, and deadlines — all in one place for your entire class.",
    color: Colors.tertiary,
    containerColor: Colors.tertiaryContainer,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Animation for the background transition
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/register');
  };

  const handleLogin = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item, index }: { item: Slide, index: number }) => {
    const IconComponent = LucideIcons[item.icon] as any;

    return (
      <View style={styles.slide}>
        <View style={styles.topSection}>
          <Animated.View
            style={[
                styles.iconGlyph,
                {
                    backgroundColor: item.containerColor,
                }
            ]}
          >
            <IconComponent 
              size={56}
              color={item.color}
              strokeWidth={2}
            />
          </Animated.View>
          <View style={styles.textBlock}>
            <Text style={styles.headline}>{item.headline}</Text>
            <Text style={styles.bodyText}>{item.body}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <Pressable
        style={styles.skipButton}
        onPress={handleLogin}
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: slideAnim } } }],
            { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      />

      <View style={styles.bottomSection}>
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => {
            const inputScaleRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = slideAnim.interpolate({
                inputRange: inputScaleRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
            });
            const dotColor = slideAnim.interpolate({
                inputRange: inputScaleRange,
                outputRange: [Colors.outlineVariant, Colors.primary, Colors.outlineVariant],
                extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { width: dotWidth, backgroundColor: dotColor }
                ]}
              />
            );
          })}
        </View>

        <View style={styles.ctaContainer}>
            {activeIndex === 2 ? (
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Button
                        label="Get Started"
                        onPress={handleComplete}
                        style={styles.mainBtn}
                    />
                    <Button
                        label="Sign into existing account"
                        variant="ghost"
                        onPress={handleLogin}
                    />
                </Animated.View>
            ) : (
                <Button
                    label="Next"
                    onPress={() => {
                        flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
                    }}
                    style={styles.mainBtn}
                />
            )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 54,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    ...Typography.m3.labelLarge,
    color: Colors.onSurfaceVariant,
    fontWeight: '700',
  },
  slide: {
    width,
    height: height * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSection: {
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 40,
  },
  iconGlyph: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    gap: 16,
    alignItems: 'center',
  },
  headline: {
    ...Typography.m3.headlineLarge,
    color: Colors.onSurface,
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 32,
  },
  bodyText: {
    ...Typography.m3.bodyLarge,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaContainer: {
    width: '100%',
    gap: 12,
  },
  mainBtn: {
    height: 56,
  }
});
