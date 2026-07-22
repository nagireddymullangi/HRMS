import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { store }           from '../store/store';
import { logout, setTokens } from '../store/slices/authSlice';
import { message }         from 'antd';

const BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// ── Create Instance ─────────────────────────────────
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ─────────────────────────────
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ────────────────────────────
let isRefreshing  = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) =>
    error ? p.reject(error) : p.resolve(token)
  );
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const original = error.config;

    // ── Handle 401 (Token Expired) ─────────────────
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry  = true;
      isRefreshing     = true;
      const refreshToken = store.getState().auth.refreshToken;

      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          null,
          { headers: { 'Refresh-Token': refreshToken } }
        );
        const { accessToken, refreshToken: newRefresh } =
          res.data.data;
        store.dispatch(
          setTokens({ accessToken, refreshToken: newRefresh })
        );
        processQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(original);
      } catch (err) {
        processQueue(err, null);
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Handle 403 ─────────────────────────────────
    if (error.response?.status === 403) {
      message.error('Access denied. Insufficient permissions.');
    }

    // ── Handle 500 ─────────────────────────────────
    if (error.response?.status >= 500) {
      message.error('Server error. Please try again.');
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;