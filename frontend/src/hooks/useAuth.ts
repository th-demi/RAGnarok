import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, AuthResponse } from '@/lib/api';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists, if not redirect to login (unless already there)
    // This is a basic client-side check. Middleware is better for robust protection but this fits the "minimal" scope.
    const token = localStorage.getItem('token');
    const path = window.location.pathname;
    if (!token && path !== '/login' && path !== '/register') {
      router.push('/login');
    }
  }, [router]);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email); // OAuth2PasswordRequestForm expects 'username'
      formData.append('password', password);
      
      const response = await api.post<AuthResponse>('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', response.data.access_token);
      router.push('/');
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password });
      // After register, usually we want them to login or auto-login. 
      // The prompt implies separate pages. Let's redirect to login.
      router.push('/login');
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return { login, register, logout, loading };
}
