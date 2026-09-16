import axios from 'axios';
import { sharedStorage } from './storage';
import { sharedConfig } from './config';

const api = axios.create({
  // We'll update the baseURL dynamically inside an interceptor if it changes,
  // or we just rely on it being set early during app initialization.
});

// Update baseURL dynamically just in case config is injected after api is created
api.interceptors.request.use((config) => {
  if (!config.baseURL && sharedConfig.backendUrl) {
    config.baseURL = `${sharedConfig.backendUrl}/api`;
  }
  return config;
});

api.interceptors.request.use(async (config) => {
  if (sharedStorage) {
    const token = await sharedStorage.getItemAsync('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Necessary for ngrok
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && sharedStorage) {
      const refresh = await sharedStorage.getItemAsync('refreshToken');
      if (refresh) {
        try {
          const { data } = await axios.post(`${sharedConfig.backendUrl}/api/auth/refresh`, 
            { refreshToken: refresh },
            { headers: { 'ngrok-skip-browser-warning': 'true' } }
          );
          await sharedStorage.setItemAsync('accessToken', data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch { 
          await sharedStorage.deleteItemAsync('accessToken'); 
          await sharedStorage.deleteItemAsync('refreshToken'); 
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
