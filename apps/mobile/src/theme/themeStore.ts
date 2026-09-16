import { create } from 'zustand';

// Tema Claro Refinado: Mais suave, melhor legibilidade e hierarquia visual
export const lightColors = {
  primary: '#0F172A', // Slate 900 (Branding forte)
  primaryText: '#FFFFFF',
  accent: '#3B82F6', // Blue 500 (Mais padrão e confiável que o Electric Blue)
  background: '#F8FAFC', // Slate 50 (Levemente acinzentado para reduzir fadiga ocular)
  backgroundSecondary: '#F1F5F9', // Slate 100
  backgroundTertiary: '#E2E8F0', // Slate 200
  surface: '#FFFFFF', // Branco puro para os cards para dar profundidade sobre o fundo cinza
  border: '#E2E8F0', // Slate 200
  text: '#1E293B', // Slate 800 (Mais suave que o preto, tom sofisticado)
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  glass: 'rgba(255, 255, 255, 0.95)',
  glassBorder: 'rgba(15, 23, 42, 0.05)',
};

// Tema Escuro: Fundo #171A25 mantido conforme solicitado anteriormente
export const darkColors = {
  primary: '#FAFAFA', 
  primaryText: '#000000', 
  accent: '#10B981', 
  background: '#171A25', 
  backgroundSecondary: '#1E212D', 
  backgroundTertiary: '#2A2E3D', 
  surface: '#1E212D', 
  border: '#2A2E3D', 
  text: '#FAFAFA', 
  textSecondary: '#A1A1AA', 
  textMuted: '#71717A', 
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  glass: 'rgba(30, 33, 45, 0.9)', 
  glassBorder: 'rgba(255, 255, 255, 0.05)',
};

interface ThemeState {
  themeMode: 'light' | 'dark' | 'system';
  colors: typeof darkColors;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'dark',
  colors: darkColors,
  setThemeMode: (mode) => set({
    themeMode: mode,
    colors: mode === 'light' ? lightColors : darkColors,
  }),
}));
