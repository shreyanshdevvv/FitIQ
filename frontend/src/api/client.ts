const BASE_URL = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('fitcoach_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('fitcoach_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('fitcoach_token');
  localStorage.removeItem('fitcoach_user');
}

export function getCurrentUser() {
  const user = localStorage.getItem('fitcoach_user');
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user: any) {
  localStorage.setItem('fitcoach_user', JSON.stringify(user));
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}
