import { jwtDecode } from 'jwt-decode';

export const DRIVER_TOKEN_KEY = 'DRIVER_auth_access_token';
export const DRIVER_REFRESH_TOKEN_KEY = 'DRIVER_auth_refresh_token';
export const DRIVER_USER_KEY = 'DRIVER_auth_user';
export const DRIVER_PROFILE_KEY = 'DRIVER_profile';
export const DRIVER_TOKEN_EXPIRY_KEY = 'DRIVER_token_expiry';

export const storageKeys = {
  TOKEN: DRIVER_TOKEN_KEY,
  REFRESH_TOKEN: DRIVER_REFRESH_TOKEN_KEY,
  DRIVER: DRIVER_USER_KEY,
  DRIVER_PROFILE: DRIVER_PROFILE_KEY,
  TOKEN_EXPIRY: DRIVER_TOKEN_EXPIRY_KEY,
} as const;

interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: unknown;
}

export const tokenManager = {
  setAccessToken: (token: string, expiresIn?: number | null): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DRIVER_TOKEN_KEY, token);
      if (expiresIn) {
        const expiryTime = Date.now() + expiresIn * 1000;
        localStorage.setItem(DRIVER_TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    }
  },

  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DRIVER_TOKEN_KEY);
    }
    return null;
  },

  getTokenExpiry: (): number | null => {
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem(DRIVER_TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    }
    return null;
  },

  setRefreshToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DRIVER_REFRESH_TOKEN_KEY, token);
    }
  },

  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DRIVER_REFRESH_TOKEN_KEY);
    }
    return null;
  },

  setDriver: (driver: Record<string, unknown> | { id: number | null; email: string; name?: string; phone?: string; imageUrl?: string; status: string }): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DRIVER_USER_KEY, JSON.stringify(driver));
    }
  },

  getDriver: (): Record<string, unknown> | null => {
    if (typeof window !== 'undefined') {
      const driver = localStorage.getItem(DRIVER_USER_KEY);
      return driver ? JSON.parse(driver) : null;
    }
    return null;
  },

  clearAuth: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DRIVER_TOKEN_KEY);
      localStorage.removeItem(DRIVER_REFRESH_TOKEN_KEY);
      localStorage.removeItem(DRIVER_USER_KEY);
      localStorage.removeItem(DRIVER_PROFILE_KEY);
      localStorage.removeItem(DRIVER_TOKEN_EXPIRY_KEY);
    }
  },

  isTokenExpired: (): boolean => {
    const expiryTime = tokenManager.getTokenExpiry();
    if (!expiryTime) {
      return true;
    }
    return Date.now() >= expiryTime;
  },

  willExpireSoon: (bufferSeconds: number = 120): boolean => {
    const expiryTime = tokenManager.getTokenExpiry();
    if (!expiryTime) {
      return true;
    }
    const timeUntilExpiry = expiryTime - Date.now();
    return timeUntilExpiry < bufferSeconds * 1000;
  },

  decodeToken: <T = DecodedToken>(token: string): T | null => {
    try {
      return jwtDecode<T>(token);
    } catch {
      return null;
    }
  },
};
