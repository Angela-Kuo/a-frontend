import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002/api', // 後端 API 根網址
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：自動在每個請求帶上 Authorization Header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // 依序嘗試讀取常見的 token 儲存 key
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('jwt');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;