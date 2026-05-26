import axios from 'axios';
import type { Patient, PatientListItem } from '../types/patient';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — token expired, redirect to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    console.error('[API Error]', err.response?.status, err.message);
    return Promise.reject(err);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await client.post('/api/v1/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  me: async () => {
    const { data } = await client.get('/api/v1/auth/me');
    return data.user;
  },
};

export const patientApi = {
  getAll: async (): Promise<PatientListItem[]> => {
    const { data } = await client.get<{ data: PatientListItem[] }>('/api/v1/patients');
    return data.data;
  },

  getSummary: async (patientId: string): Promise<Patient> => {
    const { data } = await client.get<{ data: Patient }>(
      `/api/v1/patients/${patientId}/summary`
    );
    return data.data;
  },

  getMoodTrends: async (patientId: string) => {
    const { data } = await client.get(`/api/v1/patients/${patientId}/mood`);
    return data.data;
  },

  getAISummary: async (patientId: string) => {
    const { data } = await client.get(`/api/v1/patients/${patientId}/ai-summary`);
    return data.data;
  },
};