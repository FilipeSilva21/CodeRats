import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

interface ButtonProps { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; loading?: boolean; disabled?: boolean; icon?: React.ReactNode; style?: ViewStyle; }

export function Button({ title, onPress, variant = 'primary', size = 'md', loading = false, disabled = false, icon, style }: ButtonProps) {
  return (
    <TouchableOpacity style={[s.base, s[variant], s[`sz_${size}`], disabled && s.disabled, style]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      {loading ? <ActivityIndicator color={variant === 'ghost' ? theme.colors.primary : '#fff'} size="small" /> : <>{icon}<Text style={[s.text, s[`t_${variant}`], s[`ts_${size}`]]}>{title}</Text></>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: theme.borderRadius.md, gap: 8 },
  primary: { backgroundColor: theme.colors.primary, ...theme.shadows.md },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.colors.primary },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: theme.colors.danger },
  disabled: { opacity: 0.5 },
  sz_sm: { paddingHorizontal: 16, paddingVertical: 8 },
  sz_md: { paddingHorizontal: 24, paddingVertical: 14 },
  sz_lg: { paddingHorizontal: 32, paddingVertical: 18 },
  text: { fontWeight: '600' },
  t_primary: { color: '#fff' }, t_secondary: { color: theme.colors.primary }, t_ghost: { color: theme.colors.primary }, t_danger: { color: '#fff' },
  ts_sm: { fontSize: 13 }, ts_md: { fontSize: 15 }, ts_lg: { fontSize: 17 },
} as Record<string, ViewStyle | TextStyle>);
