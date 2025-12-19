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

/**
 * AuthProvider component to wrap the app with authentication context
 */
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

  /**
   * Initialize auth state from stored tokens
   */
  const checkAuth = useCallback(async () => {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    const user = tokenManager.getUser() as User | null;

    if (refreshToken && user) {
      // Check if access token is expired or missing
      if (!accessToken || tokenManager.isTokenExpired(accessToken)) {
        // Token expired or missing, try to refresh
        // Keep isLoading true while refreshing
        await refreshAuth();
      } else {
        setAuthState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Load user profile from localStorage if available
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

        // Load user profile from localStorage if available
        try {
          const storedProfile = localStorage.getItem('user_profile');
          if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
          }
        } catch (error) {
          console.error('Failed to load stored user profile:', error);
        }
      } else {
        // Response didn't contain tokens, logout
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

        // Set a minimal profile immediately for UI, then hydrate with full details
        if (response.userId) {
          setUserProfile({
            id: response.userId,
            email: data.email,
            name: '',
            phone: '',
            dob: '',
            imageUrl: '/dummy.png',
          });

          // Call getUserDetails inside the login method when userId is available
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

        // Update global user profile with registration data
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

        // Redirect to home or dashboard
        router.push('/');
      }
    } catch (error) {
      throw error;
    }
  }, [router, setUserProfile]);

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

  /**
   * Check auth on mount and set up token refresh interval
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Set up proactive token refresh interval
   * This runs separately to proactively refresh tokens before they expire
   */
  useEffect(() => {
    // Only set up interval if user is authenticated
    if (!authState.isAuthenticated) {
      return;
    }

    // Set up interval to check token expiry - check every 30 seconds
    const interval = setInterval(() => {
      const accessToken = tokenManager.getAccessToken();
      
      if (accessToken && tokenManager.willExpireSoon(accessToken, 180)) {
        // Token will expire in 3 minutes, refresh it proactively
        refreshAuth();
      }
    }, 30000); // Check every 30 seconds

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
