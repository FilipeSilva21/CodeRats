import Constants from 'expo-constants';
import { Platform } from 'react-native';

// URL DE PRODUÇÃO (Seu backend no Render)
const PRODUCTION_URL = 'https://coderats-57w4.onrender.com';

const getBackendBaseUrl = () => {
  // Sempre vamos usar a URL de produção agora que o backend está online!
  return PRODUCTION_URL;
};

export const BACKEND_URL = getBackendBaseUrl();

// Gera a URL de WebSocket baseada na URL do Backend (robusto e automático)
export const WS_URL = BACKEND_URL
  .replace('https://', 'wss://')
  .replace('http://', 'ws://');
