import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

const SIZE_MAP = {
  sm: { size: 36, fontSize: 13, radius: 10 },
  md: { size: 40, fontSize: 14, radius: 12 },
  lg: { size: 64, fontSize: 22, radius: 20 },
  xl: { size: 80, fontSize: 28, radius: 24 },
};

export const Avatar = ({ 
  firstName = '', 
  lastName = '', 
  size = 'md', 
  style 
}: AvatarProps) => {
  const config = SIZE_MAP[size];
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

  return (
    <View style={[
      styles.container, 
      { 
        width: config.size, 
        height: config.size, 
        borderRadius: config.radius 
      }, 
      style
    ]}>
      <Text style={[styles.initials, { fontSize: config.fontSize }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: 'white',
    fontFamily: Typography.family.bold,
    fontWeight: '700',
  },
});
