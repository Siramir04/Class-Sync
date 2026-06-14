import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { changePassword } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spacing } from '../../constants/spacing';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { colors: Colors, typography: Typography } = useTheme();
    const { user } = useAuthStore();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const themedStyles = styles(Colors, Typography);

    const handleUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        if (!user?.email) return;

        setLoading(true);
        try {
            const result = await changePassword(currentPassword, newPassword);
            
            if (result.success) {
                Alert.alert('Success', 'Password updated successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', result.error || 'Could not update password.');
            }
        } catch (error: any) {
            console.error('Change password error:', error);
            Alert.alert('Error', 'Could not update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={themedStyles.container}>
            <View style={themedStyles.header}>
                <TouchableOpacity onPress={() => router.back()} style={themedStyles.headerButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.onSurface} />
                </TouchableOpacity>
                <Text style={themedStyles.title}>Change Password</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={themedStyles.content}>
                <Input
                    label="Current Password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    secureTextEntry
                />

                <Input
                    label="New Password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    secureTextEntry
                />

                <Input
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat new password"
                    secureTextEntry
                />

                <View style={themedStyles.footer}>
                    <Button
                        label="Update Password"
                        onPress={handleUpdate}
                        loading={loading}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = (Colors: any, Typography: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: Colors.outlineVariant,
        backgroundColor: Colors.surface,
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 17,
        fontFamily: Typography.family.bold,
        color: Colors.onSurface,
    },
    content: {
        padding: Spacing.lg,
    },
    footer: {
        marginTop: Spacing.xl,
    },
});
