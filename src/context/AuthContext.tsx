'use client';

import React, {
  createContext, useContext, useState, useCallback,
  useEffect, ReactNode,
} from 'react';
import { apiFetch, TokenStorage, ApiError } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isChurchMember: boolean;
  churchName: string | null;
  isEntrepreneur: boolean;
  businessName: string | null;
  departamento: string;
  municipio: string;
  memberSince: string;
  avatarUrl: string | null;
  roles: string[];
  permissions: string[];
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  isChurchMember: boolean;
  churchName?: string;
  isEntrepreneur: boolean;
  businessName?: string;
  departamento: string;
  municipio: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // starts true for hydration check

  // ── Restore session on page load ──────────────────────────────────────────
  useEffect(() => {
    const accessToken = TokenStorage.getAccess();
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    // Try to load user profile from stored token
    apiFetch<UserProfile>('/auth/me')
      .then((user) => setCurrentUser(user))
      .catch(() => {
        // Token invalid or expired — clear storage
        TokenStorage.clear();
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { accessToken, refreshToken, user } = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      TokenStorage.setTokens(accessToken, refreshToken);
      setCurrentUser(user);
      return { ok: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al iniciar sesión.';
      return { ok: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const { accessToken, refreshToken, user } = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      TokenStorage.setTokens(accessToken, refreshToken);
      setCurrentUser(user);
      return { ok: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al crear la cuenta.';
      return { ok: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors — we clear local state regardless
    } finally {
      TokenStorage.clear();
      setCurrentUser(null);
    }
  }, []);

  // ── Update profile locally (optimistic) ──────────────────────────────────
  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...data } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
