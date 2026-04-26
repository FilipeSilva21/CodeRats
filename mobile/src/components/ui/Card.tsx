import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface CardProps { children: ReactNode; variant?: 'default' | 'glass' | 'highlight'; style?: ViewStyle; }

export function Card({ children, variant = 'default', style }: CardProps) {
  return <View style={[s.base, s[variant], style]}>{children}</View>;
}

const s = StyleSheet.create({
  base: { borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, ...theme.shadows.md },
  default: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  glass: { backgroundColor: theme.colors.glass, borderWidth: 1, borderColor: theme.colors.glassBorder },
  highlight: { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.primary, ...theme.shadows.glow },
});
