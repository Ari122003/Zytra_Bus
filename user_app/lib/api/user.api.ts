import { useUserProfile } from '@/contexts/UserContext';
import { apiClient } from './client';
import type { GetUserDetailsResponse } from '@/types/user.type';

/**
 * User API service
 */
export const userApi = {
  /**
   * Get user details by ID
   */
  getUserDetails: async (userId: number): Promise<GetUserDetailsResponse> => {
    const response = await apiClient.get<GetUserDetailsResponse>(`/users/${userId}/details`);
    const data: GetUserDetailsResponse = response.data;

    
    
    
    // Set default imageUrl if not provided
    if (!data.imageUrl) {
      data.imageUrl = '/dummy.png';
    }

    return data;
  },

  

  updateProfileImage: async (userId: number, imageUrl: string): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(`/users/${userId}/update-image`, { imageUrl });

    return response.data;
  },

  /**
   * Update user information (name and date of birth)
   */
  updateUserInfo: async (userId: number, data: { name: string; dob: string }): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(`/users/${userId}/update-info`, data);
    return response.data;
  }
};
