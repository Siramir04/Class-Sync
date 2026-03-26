import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { FormGroup } from '../../components/ui/FormGroup';
import { FormRow } from '../../components/ui/FormRow';
import { Button } from '../../components/ui/Button';
import { loginUser, resetPassword, getCurrentUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

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
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Enter Email', 'Please enter your email address first.');
      return;
    }
    try {
      await resetPassword(email);
      Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
    } catch {
      Alert.alert('Error', 'Could not send reset email.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthLayout 
        title={"Welcome\nback."} 
        subtitle="Sign in to your account"
      >
        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <FormGroup>
            <FormRow 
              label="Email"
              icon="Mail"
              iconBg="#EFF6FF"
              iconColor={Colors.accentBlue}
              placeholder="example@univ.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormRow 
              label="Password"
              icon="Lock"
              isLast
              placeholder="Required"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightElement={
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              }
            />
          </FormGroup>

          <Pressable 
            onPress={handleForgotPassword} 
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <View style={{ paddingHorizontal: 14 }}>
            <Button 
              label="Sign In" 
              onPress={handleLogin} 
              loading={loading}
              variant="accentBlue" // Added custom color handling in Button or just use primary
              style={{ backgroundColor: Colors.accentBlue }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.signupText}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      </AuthLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingTop: 10,
  },
  errorBanner: {
    marginHorizontal: 14,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.errorSoft,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500',
    textAlign: 'center',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.accentBlue,
    fontWeight: '600',
  },
  eyeIcon: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600',
    paddingRight: 4,
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  signupText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accentBlue,
  },
});
