/**
 * VigiRail — API client.
 *
 * baseURL is deliberately relative by default:
 *   dev      → Vite proxies /api to FastAPI (no CORS involved)
 *   prod     → the reverse proxy / host rewrite routes /api to the API
 * Set VITE_API_URL only when the API lives on a different origin AND CORS
 * allows it (see backend .env: VIGIRAIL_CORS_ORIGINS).
 */
import axios from 'axios';

export const TOKEN_KEY = 'vigirail_token';
export const USER_KEY = 'vigirail_user';
export const TRAIN_KEY = 'vigirail_train';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handling: drop the stale session and bounce to the login screen.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginCall = error.config?.url?.includes('/auth/login');
    if (status === 401 && !isLoginCall && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export const errMsg = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.detail || error?.message || fallback;

// ── Auth ──────────────────────────────────────────────────────────
export async function loginUser(username, password) {
  const form = new URLSearchParams({ username, password });
  const { data } = await api.post('/api/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data;
}

export const fetchMe = async () => (await api.get('/api/auth/me')).data;

// ── Telemetry ─────────────────────────────────────────────────────
export const fetchSensorData = async (trainNo) =>
  (await api.get('/api/sensor-data', { params: { train: trainNo } })).data;

export const fetchHistory = async ({ limit = 50, offset = 0, train } = {}) =>
  (await api.get('/api/history', { params: { limit, offset, train } })).data;

export const fetchAlerts = async (limit = 25) =>
  (await api.get('/api/alerts', { params: { limit } })).data;

export const toggleSimulate = async (failure) =>
  (await api.post('/api/simulate', { failure })).data;

// ── Predict / fleet / model ───────────────────────────────────────
export const predict = async (payload) =>
  (await api.post('/api/predict', payload)).data;

export const fetchTrains = async () => (await api.get('/api/trains')).data;

export const fetchModelInfo = async () => (await api.get('/api/model')).data;

export const fetchStatus = async () => (await api.get('/api/status')).data;

// ── Reports ───────────────────────────────────────────────────────
export async function downloadReport(trainNo, format = 'csv') {
  const { data } = await api.get('/api/reports/inspection', {
    params: { train: trainNo, format },
    responseType: format === 'csv' ? 'blob' : 'json',
    transformResponse: [(d) => d], // keep blob raw for CSV
  });
  if (format === 'csv') {
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    link.download = `vigirail-inspection-${trainNo}-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
  return data;
}

export default api;
