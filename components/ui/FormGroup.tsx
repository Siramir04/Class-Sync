import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/spacing';

interface FormGroupProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FormGroup = ({ children, style }: FormGroupProps) => {
  return (
    <View style={[styles.container, style]}>
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
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    overflow: 'hidden',
  },
});
