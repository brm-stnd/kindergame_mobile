import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL
const API_BASE = 'https://kindergame.id';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  activeChildId?: string;
  children?: Array<{
    _id: string;
    name: string;
    birthDate: string;
    avatar?: string;
  }>;
  subscription?: {
    status: string;
    endDate?: string;
  };
}

interface GoogleUserInfo {
  email: string;
  name: string;
  googleId: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (userInfo: GoogleUserInfo) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user || data);
      } else {
        await AsyncStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      await refreshUser();
      setLoading(false);
    };
    init();
  }, []);

  const loginWithGoogle = async (userInfo: GoogleUserInfo) => {
    try {
      setLoading(true);
      
      // Send Google user info to our backend for authentication
      const response = await fetch(`${API_BASE}/api/auth/google/mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInfo),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem('authToken', data.token);
        setUser(data.user);
        return { ok: true };
      }

      return { ok: false, error: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { ok: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
