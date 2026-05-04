import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import * as LucideIcons from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showGoogle?: boolean;
}

/**
 * Material 3 (M3) Auth Layout
 * Provides a clean, tonal environment for login and registration.
 */
export const AuthLayout = ({
  title, 
  subtitle, 
  children, 
  showGoogle = true 
}: AuthLayoutProps) => {
  const insets = useSafeAreaInsets();

  // Animation for staggered entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
        })
    ]).start();
  }, []);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ 
        paddingTop: insets.top + 32,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoTile}>
            <LucideIcons.GraduationCap size={20} color={Colors.onPrimary} />
          </View>
          <Text style={styles.appName}>ClassSync</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {showGoogle && (
          <View style={styles.socialSection}>
            <Pressable 
              style={({ pressed }) => [
                styles.googleButton,
                pressed && { backgroundColor: Colors.surfaceElevation2 }
              ]}
              onPress={() => {}}
            >
              <LucideIcons.Globe size={18} color={Colors.primary} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or use email</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>
        )}

        {children}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    marginBottom: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  logoTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    ...Typography.m3.titleLarge,
    fontWeight: '900',
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  title: {
    ...Typography.m3.headlineLarge,
    color: Colors.onSurface,
    fontWeight: '900',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
  },
  subtitle: {
    ...Typography.m3.bodyLarge,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  socialSection: {
    marginBottom: 32,
  },
  googleButton: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 100, // M3 Stadium
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  googleButtonText: {
    ...Typography.m3.labelLarge,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.outlineVariant,
    opacity: 0.3,
  },
  dividerText: {
    ...Typography.m3.labelMedium,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
});
