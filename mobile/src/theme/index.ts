import { useThemeStore, darkColors } from './themeStore';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

export const themeConstants = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  // Reduced border radius as per UI_UX_PLAN.md
  borderRadius: { sm: 4, md: 6, lg: 8, xl: 12, xxl: 16, full: 9999 },
  // Removing heavy shadows/glows, relying on flat design and borders
  shadows: {
    md: { elevation: 0, shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
    glow: { elevation: 0, shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
  },
};

export function useTheme() {
  const colors = useThemeStore((state) => state.colors);
  return { colors, ...themeConstants };
}

export function useStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  createStyles: (theme: ReturnType<typeof useTheme>) => T
) {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(createStyles(theme)), [theme]);
}

// Fallback for non-reactive styles
export const theme = {
  colors: darkColors,
  ...themeConstants
};
