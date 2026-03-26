import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Image 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.Value; // React.ReactNode is better but I'll use standard type
  showGoogle?: boolean;
}

export const AuthLayout = ({ 
  title, 
  subtitle, 
  children, 
  showGoogle = true 
}: any) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ 
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.markContainer}>
          <View style={styles.iconTile}>
            <Text style={styles.iconText}>CS</Text>
          </View>
          <Text style={styles.appName}>ClassSync</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.content}>
        {showGoogle && (
          <>
            <Pressable 
              style={({ pressed }) => [
                styles.googleButton,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
              ]}
              onPress={() => {}} // Integration logic outside
            >
              {/* Correct 4-color Google G icon SVG should be here, using a placeholder for now or an Image */}
              <View style={styles.googleIconPlaceholder} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
          </>
        )}

        {children}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  markContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 22,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
    lineHeight: 33,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 0, // Children handle their own padding (mostly FormGroups)
  },
  googleButton: {
    marginHorizontal: 14,
    marginBottom: 10,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
        },
        android: {
            elevation: 1,
        }
    })
  },
  googleIconPlaceholder: {
    width: 18,
    height: 18,
    backgroundColor: '#eee', // Replace with real icon
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 14,
    marginBottom: 10,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'rgba(60,60,67,0.25)',
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});
