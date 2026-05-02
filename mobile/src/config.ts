import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ==========================================
// 1. UPDATE THIS IF YOU ARE USING NGROK!
// Example: const NGROK_URL = 'https://abcd-123.ngrok.app';
// ==========================================
const NGROK_URL: string = 'https://imprecise-antennae-sympathy.ngrok-free.dev';

const getHostUri = () => {
  if (Constants.expoConfig?.hostUri) {
    return Constants.expoConfig.hostUri.split(':')[0];
  }
  return 'localhost';
};

// Use the exact IP address of the Expo bundler if running on a physical device in dev mode.
// Fallback to localhost for web and simulators.
const host = __DEV__ && Platform.OS !== 'web' ? getHostUri() : 'localhost';

const httpScheme = NGROK_URL ? 'https' : 'http';
const wsScheme = NGROK_URL ? 'wss' : 'ws';

export const BACKEND_URL = NGROK_URL || `http://${host}:8080`;
export const WS_URL = NGROK_URL ? NGROK_URL.replace('https://', 'wss://') : `ws://${host}:8080`;
