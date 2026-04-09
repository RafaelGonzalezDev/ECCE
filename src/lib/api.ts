/**
 * API utility for communicating with the NestJS backend.
 * Handles token refresh automatically on 401 responses.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// ─── Token helpers ────────────────────────────────────────────────────────────

export const TokenStorage = {
  getAccess: () =>
    typeof window !== 'undefined' ? localStorage.getItem('ecce_access_token') : null,
  getRefresh: () =>
    typeof window !== 'undefined' ? localStorage.getItem('ecce_refresh_token') : null,
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('ecce_access_token', access);
    localStorage.setItem('ecce_refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('ecce_access_token');
    localStorage.removeItem('ecce_refresh_token');
  },
};

// ─── Internal fetch with automatic token refresh ──────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refreshToken = TokenStorage.getRefresh();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      TokenStorage.clear();
      return null;
    }
    const data = await res.json();
    TokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    TokenStorage.clear();
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const makeRequest = async (token: string | null) => {
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return fetch(`${API_BASE}${path}`, { ...options, headers });
  };

  let response = await makeRequest(TokenStorage.getAccess());

  const skipRefreshPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/verify-email', '/auth/forgot-password', '/auth/reset-password'];

  // If 401, try to refresh once (but skip for public auth routes where 401 means invalid credentials)
  if (response.status === 401 && !skipRefreshPaths.includes(path)) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = doRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;
    if (newToken) {
      response = await makeRequest(newToken);
    } else {
      // Refresh failed — session ended
      TokenStorage.clear();
      throw new ApiError(401, 'Sesión expirada. Por favor inicia sesión nuevamente.');
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.message ?? 'Error en el servidor');
  }

  return response.json() as Promise<T>;
}

// ─── Typed API Error ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
