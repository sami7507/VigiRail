/**
 * RailGuard AI — API Client
 * All HTTP calls to the FastAPI backend go through this module.
 * Token is read from AuthContext on every request.
 */
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ─────────────────────────────────────────────────────
export const loginUser = async (username, password) => {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);
  const { data } = await api.post('/api/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data; // { access_token, token_type, username, role, full_name }
};

// ── Sensor Data ──────────────────────────────────────────────
export const fetchSensorData = async (trainNo = '12951') => {
  const { data } = await api.get(`/api/sensor-data?train=${trainNo}`);
  return data;
};

// ── Predict ──────────────────────────────────────────────────
export const fetchPrediction = async (vib, temp, acou, wear) => {
  const { data } = await api.get('/api/predict', {
    params: { vibration: vib, temperature: temp, acoustic: acou, wear },
  });
  return data;
};

// ── History ──────────────────────────────────────────────────
export const fetchHistory = async (limit = 50, offset = 0) => {
  const { data } = await api.get('/api/history', { params: { limit, offset } });
  return data;
};

// ── Alerts ───────────────────────────────────────────────────
export const fetchAlerts = async (limit = 20) => {
  const { data } = await api.get('/api/alerts', { params: { limit } });
  return data;
};

// ── Simulate Failure ─────────────────────────────────────────
export const toggleSimulate = async (failure) => {
  const { data } = await api.post('/api/simulate', { failure });
  return data;
};

// ── Trains ───────────────────────────────────────────────────
export const fetchTrains = async () => {
  const { data } = await api.get('/api/trains');
  return data;
};

// ── System Status ────────────────────────────────────────────
export const fetchStatus = async () => {
  const { data } = await api.get('/api/status');
  return data;
};

export default api;
