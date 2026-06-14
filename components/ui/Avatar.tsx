import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

const SIZE_MAP = {
  sm: { size: 36, fontSize: 13 },
  md: { size: 40, fontSize: 14 },
  lg: { size: 64, fontSize: 22 },
  xl: { size: 96, fontSize: 32 },
};

export const Avatar = ({ 
  firstName = '', 
  lastName = '', 
  size = 'md', 
  style 
}: AvatarProps) => {
  const { colors: Colors, typography: Typography } = useTheme();
  const config = SIZE_MAP[size];
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

  return (
    <View style={[
      styles.container, 
      { 
        width: config.size, 
        height: config.size, 
        borderRadius: config.size / 2, // 50% — full circle per spec
        backgroundColor: Colors.primary,
        borderWidth: 2,
        borderColor: Colors.surfaceSecondary, // bgPrimary border
      }, 
      style
    ]}>
      <Text style={[
        styles.initials, 
        { 
            fontSize: config.fontSize,
            color: Colors.onPrimary,
            fontFamily: Typography.family.bold
        }
      ]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
});
