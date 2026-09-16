import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, useStyles } from '../../theme';

interface CardProps { 
  children: ReactNode; 
  style?: ViewStyle | ViewStyle[]; 
  // Mantemos a prop de variant por retrocompatibilidade no código, mas ela aplicará o mesmo estilo Clean Modern
  variant?: 'default' | 'glass' | 'highlight'; 
}

export function Card({ children, variant = 'default', style }: CardProps) {
  const s = useStyles(styles);
  return <View style={[s.base, style]}>{children}</View>;
}

const styles = (theme: ReturnType<typeof useTheme>) => ({
  base: { 
    backgroundColor: theme.colors.surface, 
    borderWidth: 1, 
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg, 
    padding: theme.spacing.lg 
  },
});
