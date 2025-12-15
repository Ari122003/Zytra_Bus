import { apiClient } from './client';
import type { GetUserDetailsResponse } from '@/types/auth.type';

/**
 * User API service
 */
export const userApi = {
  /**
   * Get user details by ID
   */
  getUserDetails: async (userId: number): Promise<GetUserDetailsResponse> => {
    const response = await apiClient.get<GetUserDetailsResponse>(`/users/${userId}/details`);
    return response.data;
  },
};
