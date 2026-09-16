import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme, useStyles } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  icon?: string;
  style?: ViewStyle | ViewStyle[];
}

export function Badge({
  label,
  variant = 'primary',
  size = 'sm',
  icon,
  style,
}: BadgeProps) {
  const theme = useTheme();
  const s = useStyles(styles);

  // In the new theme, 'primary' might map to accent color for background tints
  const bgVariant = variant === 'primary' ? 'accent' : variant;
  
  return (
    <View style={[s.base, s[`bg_${bgVariant}`], s[`size_${size}`], style]}>
      {icon && <Text style={s.icon}>{icon}</Text>}
      <Text style={[s.text, s[`size_text_${size}`]]}>{label}</Text>
    </View>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  bg_accent: { backgroundColor: `${theme.colors.accent}20` },
  bg_success: { backgroundColor: `${theme.colors.success}20` },
  bg_warning: { backgroundColor: `${theme.colors.warning}20` },
  bg_danger: { backgroundColor: `${theme.colors.danger}20` },
  size_sm: { paddingHorizontal: 8, paddingVertical: 4 },
  size_md: { paddingHorizontal: 16, paddingVertical: 6 },
  icon: { fontSize: 12 },
  text: { color: theme.colors.text, fontWeight: '600' as const },
  size_text_sm: { fontSize: 11 },
  size_text_md: { fontSize: 13 },
} as Record<string, ViewStyle | TextStyle>);