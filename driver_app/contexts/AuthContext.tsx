'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/token';
import { authApi } from '@/lib/api/auth.api';
import type { 
  Driver, 
  AuthState, 
  LoginRequest, 
  RegisterRequest,
  LoginResponse 
} from '@/types/auth.type';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  
  const [authState, setAuthState] = useState<AuthState>({
    driver: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    const driver = tokenManager.getDriver() as Driver | null;

    if (refreshToken && driver) {
      if (!accessToken || tokenManager.isTokenExpired()) {
        await refreshAuth();
      } else {
        setAuthState({
          driver,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        driver: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAuth = useCallback(async () => {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      setAuthState({
        driver: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await authApi.refreshToken({ refreshToken });

      if (response.accessToken && response.refreshToken) {
        tokenManager.setAccessToken(response.accessToken, response.expiresIn);
        tokenManager.setRefreshToken(response.refreshToken);

        const driver = tokenManager.getDriver() as Driver | null;

        setAuthState({
          driver,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        tokenManager.clearAuth();
        setAuthState({
          driver: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      tokenManager.clearAuth();
      setAuthState({
        driver: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await authApi.login(data);

    if (response.status === 'ACTIVE' && response.accessToken && response.refreshToken) {
      tokenManager.setAccessToken(response.accessToken, response.expiresIn);
      tokenManager.setRefreshToken(response.refreshToken);

      const driver: Driver = {
        id: response.driverId,
        email: data.email,
        status: response.status,
      };
      tokenManager.setDriver(driver);

      setAuthState({
        driver,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    }

    return response;
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await authApi.register(data);

    if (response.status === 'ACTIVE' && response.accessToken && response.refreshToken) {
      tokenManager.setAccessToken(response.accessToken, response.expiresIn);
      tokenManager.setRefreshToken(response.refreshToken);

      const driver: Driver = {
        id: response.driverId,
        email: data.email,
        name: data.name,
        phone: data.phone,
        status: response.status,
      };
      tokenManager.setDriver(driver);

      setAuthState({
        driver,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    }

    return response;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenManager.getRefreshToken();

    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      tokenManager.clearAuth();
      setAuthState({
        driver: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });

      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const interval = setInterval(() => {
      const accessToken = tokenManager.getAccessToken();
      const refreshToken = tokenManager.getRefreshToken();

      if (accessToken && refreshToken && authState.isAuthenticated) {
        if (tokenManager.willExpireSoon(120)) {
          console.log('Access token will expire soon, refreshing...');
          refreshAuth();
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, refreshAuth]);

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshAuth,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
