import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LucideIcons from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { FormGroup } from '../../components/ui/FormGroup';
import { FormRow } from '../../components/ui/FormRow';
import { logoutUser } from '../../services/authService';

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
           <Text style={styles.title}>Profile</Text>
           <Pressable style={styles.settingsCircle}>
             <LucideIcons.Settings size={18} color="#000" />
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
              <Text style={styles.userName}>{fullName}</Text>
              <Text style={styles.userSub}>{user?.university}</Text>
              <Text style={styles.userSub}>{user?.username ? `@${user.username}` : 'No username set'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Account security</Text>
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
            <Text style={styles.sectionLabel}>University & programme</Text>
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
            <Text style={styles.sectionLabel}>Preferences</Text>
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
            <Text style={styles.logoutText}>Sign out of ClassSync</Text>
          </Pressable>

          <Text style={styles.versionText}>Version 2.4.0 (102)</Text>
        </ScrollView>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: '#000',
    letterSpacing: -1,
    fontFamily: Typography.family.extraBold,
  },
  settingsCircle: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.separatorOpaque,
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
    color: '#000',
    letterSpacing: -0.5,
    fontFamily: Typography.family.bold,
  },
  userSub: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
    fontFamily: Typography.family.regular,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 18,
    marginBottom: 8,
    fontFamily: Typography.family.semiBold,
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
    color: Colors.error,
    fontFamily: Typography.family.semiBold,
  },
  versionText: {
    marginTop: 20,
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    opacity: 0.5,
    fontFamily: Typography.family.regular,
  },
});
