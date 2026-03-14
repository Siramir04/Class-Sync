import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { registerUser, getCurrentUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

const roles: { label: string; value: UserRole }[] = [
    { label: 'Student', value: 'student' },
    { label: 'Monitor', value: 'monitor' },
    { label: 'Lecturer', value: 'lecturer' },
];

export default function RegisterScreen() {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [university, setUniversity] = useState('');
    const [role, setRole] = useState<UserRole>('student');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
        if (!university.trim()) newErrors.university = 'University is required';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Minimum 6 characters';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const firebaseUser = await registerUser(fullName, email, university, role, password);
            const userData = await getCurrentUser(firebaseUser.uid);
            
            if (userData) {
                try {
                    setUser(userData);
                    router.replace('/(tabs)');
                } catch (navError) {
                    console.error('Registration navigation error:', navError);
                    Alert.alert('Navigation Error', 'Failed to redirect after registration.');
                }
            } else {
                throw new Error('Failed to create user profile');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            setErrors({ general: message });
        } finally {
            setLoading(false);
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join your class on ClassSync</Text>

                {errors.general ? (
                    <Text style={styles.generalError}>{errors.general}</Text>
                ) : null}

                <Input
                    label="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                    error={errors.fullName}
                />
                <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                />
                <Input
                    label="University"
                    value={university}
                    onChangeText={setUniversity}
                    placeholder="Enter your university"
                    error={errors.university}
                />

                {/* Role Selector */}
                <View style={styles.roleContainer}>
                    <Text style={styles.roleLabel}>Role</Text>
                    <View style={styles.roleSelector}>
                        {roles.map((r) => (
                            <TouchableOpacity
                                key={r.value}
                                style={[
                                    styles.rolePill,
                                    role === r.value && styles.rolePillActive,
                                ]}
                                onPress={() => setRole(r.value)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.rolePillText,
                                        role === r.value && styles.rolePillTextActive,
                                    ]}
                                >
                                    {r.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    secureTextEntry
                    error={errors.password}
                />
                <Input
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    secureTextEntry
                    error={errors.confirmPassword}
                />

                <Button
                    title="Create Account"
                    onPress={handleRegister}
                    loading={loading}
                    style={{ marginTop: Spacing.md }}
                />

                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    style={styles.loginLink}
                    activeOpacity={0.7}
                >
                    <Text style={styles.loginLinkText}>
                        Already have an account? <Text style={styles.loginLinkBold}>Log in</Text>
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
        paddingTop: 60,
        paddingBottom: Spacing.xxl,
    },
    title: {
        ...Typography.pageTitle,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
    },
    generalError: {
        ...Typography.body,
        color: Colors.error,
        backgroundColor: '#FEE2E2',
        padding: Spacing.md,
        borderRadius: Spacing.buttonRadius,
        marginBottom: Spacing.md,
    },
    roleContainer: {
        marginBottom: Spacing.md,
    },
    roleLabel: {
        ...Typography.label,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    roleSelector: {
        flexDirection: 'row',
        backgroundColor: Colors.subtleFill,
        borderRadius: Spacing.pillRadius,
        padding: 4,
    },
    rolePill: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        borderRadius: Spacing.pillRadius,
    },
    rolePillActive: {
        backgroundColor: Colors.accentBlue,
    },
    rolePillText: {
        ...Typography.buttonText,
        color: Colors.textSecondary,
    },
    rolePillTextActive: {
        color: Colors.white,
    },
    loginLink: {
        marginTop: Spacing.lg,
        alignItems: 'center',
    },
    loginLinkText: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    loginLinkBold: {
        color: Colors.accentBlue,
        fontWeight: '600',
    },
});
