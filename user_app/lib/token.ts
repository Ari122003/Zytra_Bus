import { jwtDecode } from 'jwt-decode';

export const TOKEN_KEY = 'auth_access_token';
export const REFRESH_TOKEN_KEY = 'auth_refresh_token';
export const USER_KEY = 'auth_user';

export const storageKeys = {
  TOKEN: TOKEN_KEY,
  REFRESH_TOKEN: REFRESH_TOKEN_KEY,
  USER: USER_KEY,
  USER_PROFILE: 'user_profile',
} as const;

interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: unknown;
}

export const tokenManager = {
  setAccessToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  setRefreshToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  setUser: (user: Record<string, unknown> | { id: number | null; email: string; name?: string; imageUrl?: string; status: string }): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser: (): Record<string, unknown> | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  clearAuth: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  // Checks if JWT token has expired by comparing exp timestamp with current time
  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  },

  // Checks if token will expire within bufferSeconds (default 60s) for proactive refresh
  willExpireSoon: (token: string, bufferSeconds: number = 60): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp - currentTime < bufferSeconds;
    } catch {
      return true;
    }
  },

  decodeToken: <T = DecodedToken>(token: string): T | null => {
    try {
      return jwtDecode<T>(token);
    } catch {
      return null;
    }
  },
};
