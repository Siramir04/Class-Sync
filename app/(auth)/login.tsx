import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { loginUser, resetPassword } from '../../services/authService';
import { getCurrentUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            
            try {
                setUser(userData);
                router.replace('/(tabs)');
            } catch (navError) {
                console.error('Login navigation error:', navError);
                Alert.alert('Navigation Error', 'Failed to redirect after login.');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
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
            Alert.alert('Error', 'Could not send reset email. Check your email address.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.appName}>ClassSync</Text>
                    <Text style={styles.subtitle}>Welcome back</Text>
                </View>

                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                />

                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotLink} activeOpacity={0.7}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <Button
                    title="Log In"
                    onPress={handleLogin}
                    loading={loading}
                    style={{ marginTop: Spacing.md }}
                />

                <TouchableOpacity
                    onPress={() => router.push('/(auth)/register')}
                    style={styles.signupLink}
                    activeOpacity={0.7}
                >
                    <Text style={styles.signupText}>
                        Don't have an account? <Text style={styles.signupBold}>Sign up</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: Spacing.screenPadding,
        paddingTop: 80,
        paddingBottom: Spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    appName: {
        fontSize: 28,
        fontFamily: 'DMSans_700Bold',
        color: Colors.primaryBlue,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    errorText: {
        ...Typography.body,
        color: Colors.error,
        backgroundColor: '#FEE2E2',
        padding: Spacing.md,
        borderRadius: Spacing.buttonRadius,
        marginBottom: Spacing.md,
    },
    forgotLink: {
        alignSelf: 'flex-end',
        marginTop: -Spacing.sm,
        marginBottom: Spacing.sm,
    },
    forgotText: {
        ...Typography.label,
        color: Colors.accentBlue,
    },
    signupLink: {
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    signupText: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    signupBold: {
        color: Colors.accentBlue,
        fontWeight: '600',
    },
});
