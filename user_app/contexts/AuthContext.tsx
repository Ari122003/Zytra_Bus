'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/token';
import { authApi } from '@/lib/api/auth.api';
import { userApi } from '@/lib/api/user.api';
import { useUserProfile } from './UserContext';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { setUserProfile, clearUserProfile } = useUserProfile();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    const user = tokenManager.getUser() as User | null;

    if (refreshToken && user) {
      if (!accessToken || tokenManager.isTokenExpired(accessToken)) {
        await refreshAuth();
      } else {
        setAuthState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        
        try {
          const storedProfile = localStorage.getItem('user_profile');
          if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
          }
        } catch (error) {
          console.error('Failed to load stored user profile:', error);
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        try {
          const storedProfile = localStorage.getItem('user_profile');
          if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
          }
        } catch (error) {
          console.error('Failed to load stored user profile:', error);
        }
      } else {
        tokenManager.clearAuth();
        setAuthState({
          user: null,
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
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [setUserProfile]);

  const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await authApi.login(data);

      if (response.status === 'PENDING_VERIFICATION') {
        return response;
      }

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

        if (response.userId) {
          setUserProfile({
            id: response.userId,
            email: data.email,
            name: '',
            phone: '',
            dob: '',
            imageUrl: '/dummy.png',
          });

          try {
            const details = await userApi.getUserDetails(response.userId);
            setUserProfile({
              id: response.userId,
              ...details,
              imageUrl: details.imageUrl || '/dummy.png',
            });
          } catch (e) {
            console.error('Failed to fetch user details after login:', e);
          }
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }, [setUserProfile]);

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

        if (response.userId) {
          setUserProfile({
            id: response.userId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            dob: data.dob,
            imageUrl: '/dummy.png',
          });
        }

        router.push('/');
      }
    } catch (error) {
      throw error;
    }
  }, [router, setUserProfile]);

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
      clearUserProfile();
      
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });

      router.push('/login');
    }
  }, [router, clearUserProfile]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Proactively refresh tokens before expiry: checks every 30s, refreshes if expiring within 3min
  useEffect(() => {
    if (!authState.isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      const accessToken = tokenManager.getAccessToken();
      
      if (accessToken && tokenManager.willExpireSoon(accessToken, 180)) {
        refreshAuth();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, refreshAuth]);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
