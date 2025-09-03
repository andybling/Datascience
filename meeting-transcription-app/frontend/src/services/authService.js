import api from './api';

export async function login(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password });
  if (data?.token) localStorage.setItem('token', data.token);
  return data;
}

export async function register(email, password) {
  const { data } = await api.post('/api/auth/register', { email, password });
  return data;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
}

