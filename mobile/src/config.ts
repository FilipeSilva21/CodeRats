import Constants from 'expo-constants';
import { Platform } from 'react-native';

const NGROK_URL: string = '';

const getHostUri = () => {
  if (Constants.expoConfig?.hostUri) {
    return Constants.expoConfig.hostUri.split(':')[0];
  }
  return 'localhost';
};

// Use the exact IP address of the computer on the Wi-Fi network.
const host = __DEV__ && Platform.OS !== 'web' ? '192.168.1.102' : 'localhost';

const httpScheme = NGROK_URL ? 'https' : 'http';
const wsScheme = NGROK_URL ? 'wss' : 'ws';

export const BACKEND_URL = NGROK_URL || `http://${host}:8080`;
export const WS_URL = NGROK_URL ? NGROK_URL.replace('https://', 'wss://') : `ws://${host}:8080`;
