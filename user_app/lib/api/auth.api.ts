import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  VerifyOtpRequest,
  RefreshTokenRequest,
  LogoutRequest,
} from '@/types/auth.type';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/verify-otp', data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', data);
    return response.data;
  },

  logout: async (data: LogoutRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/logout', data);
    return response.data;
  },
};
