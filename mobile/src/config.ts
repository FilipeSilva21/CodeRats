import Constants from 'expo-constants';
import { Platform } from 'react-native';

// 1. PRIORIDADE: NGROK (Se estiver usando um túnel, cole a URL aqui)
const NGROK_URL = 'https://imprecise-antennae-sympathy.ngrok-free.dev';

// 2. OVERRIDE MANUAL: Se a detecção automática falhar, coloque seu IP fixo aqui.
// Isso evita que você precise alterar a lógica da classe toda vez.
const DEV_HOST_OVERRIDE = '';

const getBackendBaseUrl = () => {
  if (NGROK_URL) return NGROK_URL;
  if (DEV_HOST_OVERRIDE) return `http://${DEV_HOST_OVERRIDE}:8080`;

  // 3. DETECÇÃO AUTOMÁTICA (Smart Default)
  // Constants.expoConfig.hostUri obtém automaticamente o IP da máquina que roda o Metro.
  const hostUri = Constants.expoConfig?.hostUri;

  if (__DEV__ && Platform.OS !== 'web' && hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8080`;
  }

  // Fallback para Web ou Produção
  return 'http://localhost:8080';
};

export const BACKEND_URL = getBackendBaseUrl();

// Gera a URL de WebSocket baseada na URL do Backend (robusto e automático)
export const WS_URL = BACKEND_URL
  .replace('https://', 'wss://')
  .replace('http://', 'ws://');
