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
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { updateUserProfile } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();
    
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [university, setUniversity] = useState(user?.university || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Full name is required.');
            return;
        }

        if (!user?.uid) return;

        setLoading(true);
        try {
            await updateUserProfile(user.uid, {
                fullName: fullName.trim(),
                university: university.trim(),
            });

            // Update local state
            setUser({
                ...user,
                fullName: fullName.trim(),
                university: university.trim(),
            });

            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert('Error', 'Could not update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Profile</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Input
                    label="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                />

                <Input
                    label="University / Institution"
                    value={university}
                    onChangeText={setUniversity}
                    placeholder="Enter university name"
                />

                <View style={styles.footer}>
                    <Button
                        title="Save Changes"
                        onPress={handleSave}
                        loading={loading}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        borderBottomColor: Colors.border + '30',
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
        fontFamily: 'DMSans_700Bold',
        color: Colors.textPrimary,
    },
    content: {
        padding: Spacing.lg,
    },
    footer: {
        marginTop: Spacing.xl,
    },
});
