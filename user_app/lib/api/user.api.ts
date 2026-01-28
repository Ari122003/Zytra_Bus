import { useUserProfile } from '@/contexts/UserContext';
import { apiClient } from './client';
import type { GetUserDetailsResponse } from '@/types/user.type';

export const userApi = {
  getUserDetails: async (userId: number): Promise<GetUserDetailsResponse> => {
    const response = await apiClient.get<GetUserDetailsResponse>(`/users/${userId}/details`);
    const data: GetUserDetailsResponse = response.data;

    if (!data.imageUrl) {
      data.imageUrl = '/dummy.png';
    }

    return data;
  },

  updateProfileImage: async (userId: number, imageUrl: string): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(`/users/${userId}/update-image`, { imageUrl });

    return response.data;
  },

  updateUserInfo: async (userId: number, data: { name: string; dob: string }): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(`/users/${userId}/update-info`, data);
    return response.data;
  }
};
