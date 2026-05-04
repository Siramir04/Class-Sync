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
import { useTheme } from '../../hooks/useTheme';
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
  iconBg,
  iconColor,
  isLast,
  onPress,
  showChevron,
  rightElement,
  value,
  ...textInputProps
}: FormRowProps) => {
  const { colors: Colors, typography: Typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const IconComponent = icon ? (LucideIcons[icon] as any) : null;

  const isPicker = !!onPress;
  
  // Resolve default colors from theme
  const resolvedIconBg = iconBg || Colors.surfaceSecondary;
  const resolvedIconColor = iconColor || Colors.textTertiary;

  return (
    <Pressable 
      disabled={!isPicker}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: Colors.surface },
        pressed && { backgroundColor: Colors.surfaceSecondary }
      ]}
    >
      {!isLast && <View style={[styles.separator, { backgroundColor: Colors.separator }]} />}
      
      {icon && (
        <View style={[
          styles.iconContainer, 
          { backgroundColor: isFocused ? Colors.primary + '15' : resolvedIconBg }
        ]}>
          <IconComponent 
            size={16} 
            color={isFocused ? Colors.primary : resolvedIconColor} 
          />
        </View>
      )}

      {label && <Text style={[styles.label, { color: Colors.textPrimary, fontFamily: Typography.family.regular }]}>{label}</Text>}

      {isPicker ? (
        <Text 
          style={[
            styles.valueText, 
            { color: Colors.textPrimary, fontFamily: Typography.family.regular },
            !value && { color: Colors.textTertiary }
          ]}
          numberOfLines={1}
        >
          {value || textInputProps.placeholder}
        </Text>
      ) : (
        <TextInput
          style={[styles.input, { color: Colors.textPrimary, fontFamily: Typography.family.regular }]}
          placeholderTextColor={Colors.textTertiary}
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
    gap: 10,
  },
  separator: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 0,
    height: 0.5,
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
    width: 90,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    textAlign: 'right',
  },
  valueText: {
    flex: 1,
    fontSize: 15,
    textAlign: 'right',
  },
  chevron: {
    opacity: 0.28,
  },
});
