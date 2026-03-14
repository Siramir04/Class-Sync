import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ViewStyle, 
  TextInputProps,
  Pressable 
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/typography';
import * as LucideIcons from 'lucide-react-native';

interface FormRowProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof LucideIcons;
  iconBg?: string;
  iconColor?: string;
  isLast?: boolean;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
  value?: string;
}

export const FormRow = ({
  label,
  icon,
  iconBg = Colors.surfaceSecondary,
  iconColor = Colors.textTertiary,
  isLast,
  onPress,
  showChevron,
  rightElement,
  value,
  ...textInputProps
}: FormRowProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const IconComponent = icon ? (LucideIcons[icon] as any) : null;

  const isPicker = !!onPress;

  return (
    <Pressable 
      disabled={!isPicker}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.pressed
      ]}
    >
      {!isLast && <View style={styles.separator} />}
      
      {icon && (
        <View style={[
          styles.iconContainer, 
          { backgroundColor: isFocused ? Colors.accentBlueSoft : iconBg }
        ]}>
          <IconComponent 
            size={16} 
            color={isFocused ? Colors.accentBlue : iconColor} 
          />
        </View>
      )}

      {label && <Text style={styles.label}>{label}</Text>}

      {isPicker ? (
        <Text 
          style={[
            styles.valueText, 
            !value && { color: Colors.textQuaternary }
          ]}
          numberOfLines={1}
        >
          {value || textInputProps.placeholder}
        </Text>
      ) : (
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textQuaternary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          {...textInputProps}
        />
      )}

      {rightElement}

      {showChevron && (
        <LucideIcons.ChevronRight 
          size={20} 
          color={Colors.textPrimary} 
          style={styles.chevron} 
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    gap: 10,
  },
  pressed: {
    backgroundColor: Colors.surfaceSecondary,
  },
  separator: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 0,
    height: 0.5,
    backgroundColor: Colors.separator,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontFamily: Typography.family.regular,
    color: Colors.textPrimary,
    width: 90,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: Typography.family.regular,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  valueText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Typography.family.regular,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  chevron: {
    opacity: 0.28,
  },
});
