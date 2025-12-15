'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/token';
import { authApi } from '@/lib/api/auth.api';
import type { 
  User, 
  AuthState, 
  LoginRequest, 
  VerifyOtpRequest,
  LoginResponse 
} from '@/types/auth.type';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<LoginResponse>;
  verifyOtp: (data: VerifyOtpRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component to wrap the app with authentication context
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  /**
   * Initialize auth state from stored tokens
   */
  const checkAuth = useCallback(() => {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    const user = tokenManager.getUser() as User | null;

    if (accessToken && refreshToken && user) {
      // Check if token is expired
      if (tokenManager.isTokenExpired(accessToken)) {
        // Token expired, try to refresh
        refreshAuth();
      } else {
        setAuthState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
    // refreshAuth is defined below and stable, safe to omit from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Refresh authentication tokens
   */
  const refreshAuth = useCallback(async () => {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      setAuthState({
        user: null,
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
        tokenManager.setAccessToken(response.accessToken);
        tokenManager.setRefreshToken(response.refreshToken);

        const user = tokenManager.getUser() as User | null;

        setAuthState({
          user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      tokenManager.clearAuth();
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  /**
   * Login function
   */
  const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await authApi.login(data);

      // Check if user is new (needs OTP verification)
      if (response.status === 'PENDING_VERIFICATION') {
        return response;
      }

      // Existing user - store tokens and user data
      if (response.accessToken && response.refreshToken) {
        tokenManager.setAccessToken(response.accessToken);
        tokenManager.setRefreshToken(response.refreshToken);

        const user: User = {
          id: response.userId ?? null,
          email: data.email,
          status: response.status,
        };

        tokenManager.setUser(user);

        setAuthState({
          user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      }

      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Verify OTP and complete registration
   */
  const verifyOtp = useCallback(async (data: VerifyOtpRequest): Promise<void> => {
    try {
      const response = await authApi.verifyOtp(data);

      if (response.accessToken && response.refreshToken) {
        tokenManager.setAccessToken(response.accessToken);
        tokenManager.setRefreshToken(response.refreshToken);

        const user: User = {
          id: response.userId ?? null,
          email: data.email,
          name: data.name,
          status: response.status,
        };

        tokenManager.setUser(user);

        setAuthState({
          user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        // Redirect to home or dashboard
        router.push('/');
      }
    } catch (error) {
      throw error;
    }
  }, [router]);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    const refreshToken = tokenManager.getRefreshToken();

    try {
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearAuth();
      
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });

      router.push('/login');
    }
  }, [router]);

  /**
   * Check auth on mount and set up token refresh interval
   */
  useEffect(() => {
    checkAuth();

    // Set up interval to check token expiry
    const interval = setInterval(() => {
      const accessToken = tokenManager.getAccessToken();
      
      if (accessToken && tokenManager.willExpireSoon(accessToken, 120)) {
        // Token will expire in 2 minutes, refresh it
        refreshAuth();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkAuth, refreshAuth]);

  const value: AuthContextType = {
    ...authState,
    login,
    verifyOtp,
    logout,
    refreshAuth,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
