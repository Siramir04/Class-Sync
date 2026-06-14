import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Platform,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import * as LucideIcons from 'lucide-react-native';
import { loginWithGoogle } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showGoogle?: boolean;
}

/**
 * Auth Layout — Teal design system
 * Clean airy background, teal branding, smooth entrance animation
 */
export const AuthLayout = ({
  title, 
  subtitle, 
  children, 
  showGoogle = true 
}: AuthLayoutProps) => {
  const { colors: Colors, typography: Typography } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(Colors, Typography);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const firebaseUser = await loginWithGoogle();
      const { getCurrentUser } = await import('../../services/authService');
      const userData = await getCurrentUser(firebaseUser.uid);
      if (userData) {
        setUser(userData);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (Platform.OS === 'web') {
        alert(err.message || 'Google Sign-In failed');
      } else {
        Alert.alert('Sign In Failed', err.message || 'Google Sign-In failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

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
        ...(Platform.OS === 'web' ? { maxWidth: 480, alignSelf: 'center' as any, width: '100%' as any } : {}),
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
                pressed && { backgroundColor: Colors.surfaceElevation2 },
                googleLoading && { opacity: 0.7 }
              ]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <LucideIcons.Globe size={18} color={Colors.primary} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
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

const createStyles = (Colors: any, Typography: any) => StyleSheet.create({
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
    backgroundColor: Colors.primary, // Deep teal
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    ...Typography.appTitle,
    fontWeight: '900',
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  title: {
    ...Typography.screenTitle,
    color: Colors.onSurface,
    fontWeight: '900',
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
  },
  subtitle: {
    ...Typography.m3.bodyLarge,
    color: Colors.textSecondary,
    marginTop: 8,
    opacity: 0.8,
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
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
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
    backgroundColor: Colors.borderSubtle,
    opacity: 0.5,
  },
  dividerText: {
    ...Typography.m3.labelLarge,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
