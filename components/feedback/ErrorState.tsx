import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Material 3 (M3) Reusable Error State
 * Provides a clear message and an optional retry action.
 */
export const ErrorState = ({ message = 'Something went wrong', onRetry }: ErrorStateProps) => {
  const { colors, typography } = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={[typography.m3.bodyMedium, { color: colors.textSecondary, textAlign: 'center' }]}>
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity 
          onPress={onRetry} 
          style={[styles.button, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={[typography.m3.labelLarge, { color: colors.onPrimary }]}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  button: { 
    marginTop: 16, 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 10 
  },
});
