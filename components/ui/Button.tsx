import React from 'react';
import { 
  Text, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  View
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import * as LucideIcons from 'lucide-react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'tonal' | 'outlined' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof LucideIcons;
  style?: ViewStyle;
}

/**
 * Material 3 (M3) Button Component
 * Features fully rounded stadium shapes and tonal color mappings.
 */
export const Button = ({
  label, 
  onPress, 
  variant = 'filled',
  disabled = false, 
  loading = false,
  icon,
  style 
}: ButtonProps) => {
  const IconComponent = icon ? (LucideIcons[icon] as any) : null;

  const getContainerStyle = () => {
    switch (variant) {
      case 'filled':
        return [styles.base, styles.filled, style];
      case 'tonal':
        return [styles.base, styles.tonal, style];
      case 'outlined':
        return [styles.base, styles.outlined, style];
      case 'danger':
        return [styles.base, styles.danger, style];
      case 'ghost':
        return [styles.ghost, style];
      default:
        return [styles.base, styles.filled, style];
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'filled':
        return { color: Colors.onPrimary };
      case 'tonal':
        return { color: Colors.onPrimaryContainer };
      case 'outlined':
      case 'ghost':
        return { color: Colors.primary };
      case 'danger':
        return { color: Colors.onError };
      default:
        return { color: Colors.onPrimary };
    }
  };

  const getIconColor = () => {
    const textStyle = getTextStyle();
    return textStyle.color as string;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        getContainerStyle(),
        disabled && styles.disabled,
        pressed && !disabled && { opacity: 0.88, transform: [{ scale: 0.98 }] }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getIconColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {IconComponent && (
            <IconComponent 
              size={18} 
              color={getIconColor()}
              style={{ marginRight: 8 }} 
            />
          )}
          <Text style={[styles.label, getTextStyle()]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 44, // M3 Standard height
    borderRadius: 100, // M3 Stadium shape
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: Colors.primary,
  },
  tonal: {
    backgroundColor: Colors.primaryContainer,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  ghost: {
    height: 44,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: Typography.family.medium,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  disabled: {
    opacity: 0.38,
    backgroundColor: Colors.onSurface + '1F', // 12% opacity
  },
});
