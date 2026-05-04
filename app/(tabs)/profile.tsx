import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { FormGroup } from '../../components/ui/FormGroup';
import { FormRow } from '../../components/ui/FormRow';
import { logoutUser } from '../../services/authService';

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors: Colors, typography: Typography } = useTheme();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await logoutUser();
                    logout();
                    router.replace('/(auth)/login');
                },
            },
        ]);
    };

    const fullName = user?.fullName || 'User';
    const firstName = fullName.split(' ')[0];
    const lastName = fullName.split(' ')[1] || '';

    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
           <Text style={[styles.title, { color: Colors.onSurface, fontFamily: Typography.family.extraBold }]}>Profile</Text>
           <Pressable style={[styles.settingsCircle, { backgroundColor: Colors.surface, borderColor: Colors.separatorOpaque }]}>
             <LucideIcons.Settings size={18} color={Colors.onSurface} />
           </Pressable>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {/* Hero Section */}
          <View style={styles.hero}>
            <Avatar 
              firstName={firstName} 
              lastName={lastName} 
              size="xl" 
            />
            <View style={styles.heroText}>
              <Text style={[styles.userName, { color: Colors.onSurface, fontFamily: Typography.family.bold }]}>{fullName}</Text>
              <Text style={[styles.userSub, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>{user?.university}</Text>
              <Text style={[styles.userSub, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>{user?.username ? `@${user.username}` : 'No username set'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Typography.family.semiBold }]}>Account security</Text>
            <FormGroup>
               <FormRow 
                 label="Security & Privacy"
                 icon="Shield"
                 onPress={() => {}}
               />
               <FormRow 
                 label="Change Password"
                 icon="Lock"
                 isLast
                 onPress={() => router.push('/settings/change-password')}
               />
            </FormGroup>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Typography.family.semiBold }]}>University & programme</Text>
            <FormGroup>
               <FormRow 
                 label="University Details"
                 icon="Search"
                 onPress={() => {}}
               />
               <FormRow 
                 label="Programme of Study"
                 icon="Globe"
                 isLast
                 onPress={() => {}}
               />
            </FormGroup>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Typography.family.semiBold }]}>Preferences</Text>
            <FormGroup>
               <FormRow 
                 label="Notifications"
                 icon="Bell"
                 onPress={() => router.push('/settings/notifications')}
               />
               <FormRow 
                 label="Schedule Alarms"
                 icon="Clock"
                 isLast
                 onPress={() => {}}
               />
            </FormGroup>
          </View>

          <View style={styles.section}>
            <FormGroup>
               <FormRow 
                 label="Help & Support"
                 icon="HelpCircle"
                 isLast
                 onPress={() => {}}
               />
            </FormGroup>
          </View>

          <Pressable 
            onPress={handleLogout}
            style={({ pressed }) => [
               styles.logoutButton,
               pressed && { opacity: 0.7 }
            ]}
          >
            <Text style={[styles.logoutText, { color: Colors.error, fontFamily: Typography.family.semiBold }]}>Sign out of ClassSync</Text>
          </Pressable>

          <Text style={[styles.versionText, { color: Colors.textTertiary, fontFamily: Typography.family.regular }]}>Version 2.4.0 (102)</Text>
        </ScrollView>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  settingsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroText: {
    alignItems: 'center',
    marginTop: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  userSub: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  versionText: {
    marginTop: 20,
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.5,
  },
});
