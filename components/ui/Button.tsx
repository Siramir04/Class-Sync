import React from 'react';
import { 
  Text, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import * as LucideIcons from 'lucide-react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'navy' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof LucideIcons;
  style?: ViewStyle;
}

export const Button = ({ 
  label, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  icon,
  style 
}: ButtonProps) => {
  const IconComponent = icon ? (LucideIcons[icon] as any) : null;

  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.base, styles.primary, style];
      case 'navy':
        return [styles.base, styles.navy, style];
      case 'ghost':
        return [styles.ghost, style];
      default:
        return [styles.base, styles.primary, style];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'navy':
        return styles.textWhite;
      case 'ghost':
        return styles.textGhost;
      default:
        return styles.textWhite;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        getContainerStyle(),
        disabled && styles.disabled,
        pressed && !disabled && { opacity: 0.9, transform: [{ scale: 0.97 }] }
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? Colors.accentBlue : 'white'} />
      ) : (
        <>
          {IconComponent && (
            <IconComponent 
              size={18} 
              color={variant === 'ghost' ? Colors.accentBlue : 'white'} 
              style={{ marginRight: 8 }} 
            />
          )}
          <Text style={[getTextStyle(), variant === 'ghost' ? styles.labelGhost : styles.labelBase]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: Spacing.buttonHeight,
    borderRadius: Spacing.buttonRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: Colors.accentBlue,
  },
  navy: {
    backgroundColor: Colors.primaryNavy,
  },
  ghost: {
    height: 44,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWhite: {
    color: 'white',
    fontFamily: Typography.family.bold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  textGhost: {
    color: Colors.accentBlue,
    fontFamily: Typography.family.medium,
    fontSize: 14,
  },
  labelBase: {
    fontWeight: '700',
  },
  labelGhost: {
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.45,
  },
});
