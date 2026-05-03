import { create } from 'zustand';

// Tema Claro: "Quase branco", seguindo Clean Modern (alto contraste, limpo)
export const lightColors = {
  primary: '#09090B', // Zinc 950 (Quase preto para botões primários)
  primaryText: '#FAFAFA', // Zinc 50
  accent: '#007AFF', // Electric Blue
  background: '#FCFCFC', // Quase branco
  backgroundSecondary: '#F4F4F5', // Zinc 100
  backgroundTertiary: '#E4E4E7', // Zinc 200
  surface: '#FFFFFF', // Branco puro para cards
  border: '#E4E4E7', // Zinc 200
  text: '#09090B', // Zinc 950
  textSecondary: '#52525B', // Zinc 500
  textMuted: '#A1A1AA', // Zinc 400
  success: '#10B981', // Emerald
  warning: '#F59E0B',
  danger: '#EF4444',
  glass: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(0, 0, 0, 0.05)',
};

// Tema Escuro: Fundo ao redor de #171a25, moderno, sem brilhos
export const darkColors = {
  primary: '#FAFAFA', // Zinc 50 (Branco para botões primários, estilo premium)
  primaryText: '#000000', // Preto no texto do botão primário
  accent: '#10B981', // Neon Green (para quebrar a monocromia de forma vibrante)
  background: '#171A25', // Cor solicitada pelo usuário
  backgroundSecondary: '#1E212D', // Levemente mais claro que o fundo
  backgroundTertiary: '#2A2E3D', // Para hovers ou destaques sutis
  surface: '#1E212D', // Cards com cor sólida, sem vidro
  border: '#2A2E3D', // Bordas sutis
  text: '#FAFAFA', // Zinc 50
  textSecondary: '#A1A1AA', // Zinc 400
  textMuted: '#71717A', // Zinc 500
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  glass: 'rgba(30, 33, 45, 0.9)', // Adaptado para a nova cor sólida
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
