import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import * as LucideIcons from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Slide {
  icon: keyof typeof LucideIcons;
  headline: string;
  body: string;
}

const slides: Slide[] = [
  {
    icon: 'Bell',
    headline: "Never miss\na class.",
    body: "Get instant notifications for lectures, assignments, and cancellations the moment they're posted.",
  },
  {
    icon: 'LayoutGrid',
    headline: "One Space\nfor your class.",
    body: "Your Monitor creates a Space for your level. Join once and stay connected to every course automatically.",
  },
  {
    icon: 'Users',
    headline: "Your class,\nalways in sync.",
    body: "Schedules, announcements, and deadlines — all in one place for your entire class.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleComplete = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/register');
  };

  const handleLogin = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    const IconComponent = LucideIcons[item.icon] as any;
    return (
      <View style={styles.slide}>
        <View style={styles.topSection}>
          <View style={styles.iconGlyph}>
            <IconComponent 
              size={44} 
              color="white" 
              strokeWidth={1.4}
            />
          </View>
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
      <StatusBar barStyle="light-content" />
      
      {activeIndex < 2 && (
        <Pressable 
          style={styles.skipButton} 
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      />

      <View style={styles.bottomSection}>
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {activeIndex === 2 ? (
          <View style={styles.ctaContainer}>
            <Pressable 
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }
              ]}
              onPress={handleComplete}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </Pressable>
            
            <Pressable 
              style={({ pressed }) => [
                styles.ghostButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={handleLogin}
            >
              <Text style={styles.ghostButtonText}>
                Already have an account? <Text style={{ color: 'white' }}>Sign in</Text>
              </Text>
            </Pressable>
          </View>
        ) : (
            <View style={{ height: 110 }} /> // Placeholder to keep layout stable
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  skipButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    fontSize: 12,
    fontFamily: Typography.family.semiBold,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  slide: {
    width,
    height,
    flex: 1,
  },
  topSection: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 32,
  },
  iconGlyph: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(37,99,235,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    gap: 16,
  },
  headline: {
    fontSize: 28,
    fontFamily: Typography.family.extraBold,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -1,
    lineHeight: 28 * 1.15,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 14,
    fontFamily: Typography.family.regular,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 14 * 1.65,
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  activeDot: {
    width: 22,
    backgroundColor: 'white',
  },
  inactiveDot: {
    width: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  ctaContainer: {
    gap: 12,
  },
  primaryButton: {
    height: 54,
    backgroundColor: 'white',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: Typography.family.bold,
    fontWeight: '700',
    color: '#0A1628',
    letterSpacing: -0.3,
  },
  ghostButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    fontSize: 14,
    fontFamily: Typography.family.medium,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
  },
});
