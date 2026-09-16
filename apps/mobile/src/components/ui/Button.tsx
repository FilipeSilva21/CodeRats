import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme, useStyles } from '../../theme';

interface ButtonProps { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; loading?: boolean; disabled?: boolean; icon?: React.ReactNode; style?: ViewStyle | ViewStyle[]; }

export function Button({ title, onPress, variant = 'primary', size = 'md', loading = false, disabled = false, icon, style }: ButtonProps) {
  const theme = useTheme();
  const s = useStyles(styles);

  return (
    <TouchableOpacity style={[s.base, s[variant], s[`sz_${size}`], disabled && s.disabled, style]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? theme.colors.primaryText : theme.colors.primary} size="small" /> : <>{icon}<Text style={[s.text, s[`t_${variant}`], s[`ts_${size}`]]}>{title}</Text></>}
    </TouchableOpacity>
  );
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: theme.borderRadius.sm, gap: 8 },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: theme.colors.danger },
  disabled: { opacity: 0.5 },
  sz_sm: { paddingHorizontal: 16, paddingVertical: 8 },
  sz_md: { paddingHorizontal: 24, paddingVertical: 14 },
  sz_lg: { paddingHorizontal: 32, paddingVertical: 16 },
  text: { fontWeight: '700' as const, letterSpacing: 0.5 },
  t_primary: { color: theme.colors.primaryText }, t_secondary: { color: theme.colors.text }, t_ghost: { color: theme.colors.textSecondary }, t_danger: { color: '#fff' },
  ts_sm: { fontSize: 13 }, ts_md: { fontSize: 15 }, ts_lg: { fontSize: 17 },
} as Record<string, ViewStyle | TextStyle>);