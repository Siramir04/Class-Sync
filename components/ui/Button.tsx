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
import { useTheme } from '../../hooks/useTheme';
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
  const { colors: Colors, typography: Typography } = useTheme();
  const IconComponent = icon ? (LucideIcons[icon] as any) : null;

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

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    let baseStyle: ViewStyle = {
        height: 44,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    };

    switch (variant) {
      case 'filled':
        baseStyle.backgroundColor = Colors.primary;
        break;
      case 'tonal':
        baseStyle.backgroundColor = Colors.primaryContainer;
        break;
      case 'outlined':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = Colors.outline;
        break;
      case 'danger':
        baseStyle.backgroundColor = Colors.error;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.paddingHorizontal = 12;
        break;
    }

    if (disabled) {
        baseStyle.opacity = 0.38;
        if (variant !== 'outlined' && variant !== 'ghost') {
            baseStyle.backgroundColor = Colors.onSurface + '1F';
        }
    }

    if (pressed && !disabled) {
        baseStyle.opacity = 0.88;
        baseStyle.transform = [{ scale: 0.98 }];
    }

    return baseStyle;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        getContainerStyle(pressed),
        style
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
          <Text style={[styles.label, getTextStyle(), { fontFamily: Typography.family.medium }]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
