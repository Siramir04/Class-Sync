import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Platform } from 'react-native';
import { LightPalette } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export default function VideoIntro({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  // useNativeDriver is not supported on web — fall back to JS driver
  const useNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver,
        }),
      ]),
      Animated.delay(1500),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.appName}>ClassSync</Text>
        <Text style={styles.tagline}>Your class, always in sync</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LightPalette.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    width,
    height,
  },
  content: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontFamily: 'DMSans_700Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
  },
});
