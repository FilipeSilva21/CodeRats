import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  icon?: string;
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'primary',
  size = 'sm',
  icon,
  style,
}: BadgeProps) {
  return (
    <View style={[styles.base, styles[`bg_${variant}`], styles[`size_${size}`], style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.text, styles[`size_text_${size}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  bg_primary: { backgroundColor: `${theme.colors.primary}30` },
  bg_accent: { backgroundColor: `${theme.colors.accent}30` },
  bg_success: { backgroundColor: `${theme.colors.success}30` },
  bg_warning: { backgroundColor: `${theme.colors.warning}30` },
  bg_danger: { backgroundColor: `${theme.colors.danger}30` },
  size_sm: { paddingHorizontal: 10, paddingVertical: 4 },
  size_md: { paddingHorizontal: 14, paddingVertical: 6 },
  icon: { fontSize: 12 },
  text: { color: theme.colors.text, fontWeight: '600' },
  size_text_sm: { fontSize: 11 },
  size_text_md: { fontSize: 13 },
} as Record<string, any>);
