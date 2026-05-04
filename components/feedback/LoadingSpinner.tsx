import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

/**
 * Material 3 (M3) Reusable Loading Spinner
 * Centered within its parent container.
 */
export const LoadingSpinner = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});
