import axios from 'axios';
import { storage } from './storage';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

api.interceptors.request.use(async (config) => {
  const token = await storage.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = await storage.getItemAsync('refreshToken');
      if (refresh) {
        try {
          const { data } = await axios.post('http://localhost:8080/api/auth/refresh', { refreshToken: refresh });
          await storage.setItemAsync('accessToken', data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch { await storage.deleteItemAsync('accessToken'); await storage.deleteItemAsync('refreshToken'); }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
