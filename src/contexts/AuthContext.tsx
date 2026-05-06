import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { SERVER_URL } from '../lib/gemini';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (name: string, gender: string, password?: string) => Promise<void>;
  register: (name: string, gender: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/auth/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const login = async (name: string, gender: string, password = 'password') => {
    const res = await fetch(`${SERVER_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    } else {
      throw new Error('Login failed');
    }
  };

  const register = async (name: string, gender: string, password = 'password') => {
    const res = await fetch(`${SERVER_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, gender, password }),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    } else {
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    await fetch(`${SERVER_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
