import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = await SecureStore.getItemAsync('refreshToken');
      if (refresh) {
        try {
          const { data } = await axios.post('http://localhost:8080/api/auth/refresh', { refreshToken: refresh });
          await SecureStore.setItemAsync('accessToken', data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch { await SecureStore.deleteItemAsync('accessToken'); await SecureStore.deleteItemAsync('refreshToken'); }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
