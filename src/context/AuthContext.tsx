import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'customer';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_STORAGE_KEY = 'auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!savedToken) return;
    setToken(savedToken);
    apiRequest<{ user: User }>('/auth/me', { token: savedToken })
      .then((payload) => setUser(payload.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      });
  }, []);

  const login = async (email: string, password: string) => {
    const payload = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
    });
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
  };

  const signup = async (email: string, password: string, name: string) => {
    const payload = await apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password, name: name.trim() },
    });
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin' || user?.role === 'owner',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
