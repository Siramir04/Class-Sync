import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/spacing';

interface FormGroupProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FormGroup = ({ children, style }: FormGroupProps) => {
  const { colors: Colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: Colors.surface }, style]}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const isLast = index === React.Children.count(children) - 1;
        return React.cloneElement(child, { 
          isLast,
          // Passing hideSeparator based on isLast inside FormRow
        } as any);
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.cardRadius,
    overflow: 'hidden',
  },
});
