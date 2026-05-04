import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { loginUser, resetPassword, getCurrentUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import * as LucideIcons from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const firebaseUser = await loginUser(email, password);
      const userData = await getCurrentUser(firebaseUser.uid);
      
      setUser(userData);
      router.replace('/(tabs)');
    } catch (err: unknown) {
        const error = err as { message: string };
        Alert.alert('Login Error', error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthLayout 
        title={"Welcome\nBack."}
        subtitle="Sign in to your ClassSync account"
      >
        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorBanner}>
              <LucideIcons.AlertCircle size={16} color={Colors.onErrorContainer} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputs}>
            <Input
              label="Email Address"
              placeholder="Enter your university email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <View>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                >
                    <LucideIcons.Eye size={20} color={showPassword ? Colors.primary : Colors.onSurfaceVariant} />
                </Pressable>
            </View>
          </View>

          <Pressable 
            onPress={async () => {
                if (!email) {
                    Alert.alert('Reset Password', 'Please enter your email address first.');
                    return;
                }
                try {
                    await resetPassword(email);
                    Alert.alert('Success', 'Password reset email sent. Check your inbox.');
                } catch (err: unknown) {
                    const error = err as { message: string };
                    Alert.alert('Error', error.message || 'Failed to send reset email.');
                }
            }}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Button
            label="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to ClassSync?</Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.signupText}>Create an account</Text>
            </Pressable>
          </View>
        </View>
      </AuthLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.errorContainer,
    borderRadius: 16,
    marginBottom: 24,
  },
  errorText: {
    ...Typography.m3.labelLarge,
    color: Colors.onErrorContainer,
    fontWeight: '700',
  },
  inputs: {
    gap: 8,
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
    top: 18,
    zIndex: 20,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 32,
    marginTop: -8,
  },
  forgotText: {
    ...Typography.m3.labelLarge,
    color: Colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    height: 56,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  footerText: {
    ...Typography.m3.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  signupText: {
    ...Typography.m3.labelLarge,
    color: Colors.primary,
    fontWeight: '900',
  },
});
