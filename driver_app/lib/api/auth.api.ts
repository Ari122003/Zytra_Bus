import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  LogoutRequest,
} from '@/types/auth.type';

/**
 * Auth API service for driver app
 */
export const authApi = {
  /**
   * Login driver
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Register new driver
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', data);
    return response.data;
  },

  /**
   * Logout driver
   */
  logout: async (data: LogoutRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/logout', data);
    return response.data;
  },
};
