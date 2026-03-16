import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Document {
  id: number;
  filename: string;
  created_at?: string;
}

export interface AskResponse {
  answer: string;
  sources: Array<{
    filename: string;
    text: string;
  }>;
}

export interface AskRequest {
  question: string;
  document_ids?: number[];
}
