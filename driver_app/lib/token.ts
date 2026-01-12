import { jwtDecode } from 'jwt-decode';

export const TOKEN_KEY = 'driver_auth_access_token';
export const REFRESH_TOKEN_KEY = 'driver_auth_refresh_token';
export const DRIVER_KEY = 'driver_auth_user';

export const storageKeys = {
  TOKEN: TOKEN_KEY,
  REFRESH_TOKEN: REFRESH_TOKEN_KEY,
  DRIVER: DRIVER_KEY,
  DRIVER_PROFILE: 'driver_profile',
} as const;

interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: unknown;
}

/**
 * Token management utilities for secure storage and retrieval
 */
export const tokenManager = {
  /**
   * Store access token securely
   */
  setAccessToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  /**
   * Get stored access token
   */
  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  /**
   * Store refresh token securely
   */
  setRefreshToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Store driver data
   */
  setDriver: (driver: Record<string, unknown> | { id: number | null; email: string; name?: string; phone?: string; imageUrl?: string; status: string }): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DRIVER_KEY, JSON.stringify(driver));
    }
  },

  /**
   * Get stored driver data
   */
  getDriver: (): Record<string, unknown> | null => {
    if (typeof window !== 'undefined') {
      const driver = localStorage.getItem(DRIVER_KEY);
      return driver ? JSON.parse(driver) : null;
    }
    return null;
  },

  /**
   * Clear all auth data
   */
  clearAuth: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(DRIVER_KEY);
      localStorage.removeItem(storageKeys.DRIVER_PROFILE);
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  },

  /**
   * Check if token will expire soon (within 1 minute)
   */
  willExpireSoon: (token: string, bufferSeconds: number = 60): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp - currentTime < bufferSeconds;
    } catch {
      return true;
    }
  },

  /**
   * Decode token and return payload
   */
  decodeToken: <T = DecodedToken>(token: string): T | null => {
    try {
      return jwtDecode<T>(token);
    } catch {
      return null;
    }
  },
};
