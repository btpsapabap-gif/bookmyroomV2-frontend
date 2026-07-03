import { apiRequest } from './api';

const TOKEN_KEY = 'bookmyroom_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(mobile_number, password) {
  const { token, profile } = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ mobile_number, password })
  });
  setToken(token);
  return profile;
}

export async function register(full_name, mobile_number, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ full_name, mobile_number, password })
  });
}

export async function fetchCurrentProfile() {
  const token = getToken();
  if (!token) return null;
  try {
    const { profile } = await apiRequest('/api/auth/me');
    return profile;
  } catch {
    clearToken();
    return null;
  }
}

export function logout() {
  clearToken();
  window.location.href = '/login';
}
