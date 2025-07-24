import { auth } from './firebase';

// API helper that automatically includes Firebase auth token
export const apiRequest = async (method: string, url: string, body?: any) => {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
};