import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/client';
import type { User, LoginResponse, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await apiClient.get('/user/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user', error);
      localStorage.removeItem('access_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    const { access_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);
    setUser(user);
  };

  const register = async (data: RegisterData) => {
    await apiClient.post('/auth/register', data);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};