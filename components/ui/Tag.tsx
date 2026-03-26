import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';

export type TagType = 
  | 'lecture' | 'assignment' | 'test' | 'note' | 'announcement' 
  | 'cancellation' | 'carryover' | 'monitor' | 'lecturer'
  | 'federal' | 'state' | 'private';

interface TagProps {
  label: string;
  type?: TagType;
  style?: ViewStyle;
}

const TYPE_MAP: Record<TagType, { bg: string; text: string }> = {
  lecture:      { bg: '#EFF6FF', text: '#2563EB' },
  assignment:   { bg: '#FEF3C7', text: '#D97706' },
  test:         { bg: '#FEE2E2', text: '#DC2626' },
  note:         { bg: '#F0FDF4', text: '#16A34A' },
  announcement: { bg: '#EDE9FE', text: '#7C3AED' },
  cancellation: { bg: '#FEE2E2', text: '#DC2626' },
  carryover:    { bg: '#EDE9FE', text: '#7C3AED' },
  monitor:      { bg: '#EFF6FF', text: '#1A3C6E' },
  lecturer:     { bg: '#F0FDF4', text: '#16A34A' },
  federal:      { bg: Colors.federal, text: Colors.federalText },
  state:        { bg: Colors.state, text: Colors.stateText },
  private:      { bg: Colors.private, text: Colors.privateText },
};

export const Tag = ({ label, type = 'lecture', style }: TagProps) => {
  const colors = TYPE_MAP[type] || TYPE_MAP.lecture;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
