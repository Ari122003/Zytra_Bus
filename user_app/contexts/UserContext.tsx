'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { storageKeys } from '@/lib/token';
import type { GetUserDetailsResponse } from '@/types/user.type';

interface UserProfile extends GetUserDetailsResponse {
  id: number;
}

interface UserContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  setUserProfile: (profile: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<Omit<UserProfile, 'id'>>) => void;
  clearUserProfile: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * UserProvider component to manage user profile data separately from auth
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKeys.USER_PROFILE);
      if (stored) {
        setUserProfileState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever profile changes
  const setUserProfile = useCallback((profile: UserProfile | null) => {
    setUserProfileState(profile);
    if (profile) {
      localStorage.setItem(storageKeys.USER_PROFILE, JSON.stringify(profile));
    } else {
      localStorage.removeItem(storageKeys.USER_PROFILE);
    }
  }, []);

  // Update specific fields of user profile
  const updateUserProfile = useCallback((updates: Partial<Omit<UserProfile, 'id'>>) => {
    setUserProfileState(prev => {
      if (!prev) return prev;
      
      const updated = { ...prev, ...updates };
      console.log(updated);
      
      localStorage.setItem(storageKeys.USER_PROFILE, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear user profile
  const clearUserProfile = useCallback(() => {
    setUserProfileState(null);
    localStorage.removeItem(storageKeys.USER_PROFILE);
  }, []);

  const value: UserContextType = {
    userProfile,
    isLoading,
    setUserProfile,
    updateUserProfile,
    clearUserProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * Hook to use user profile context
 */
export const useUserProfile = () => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProvider');
  }
  
  return context;
};
