import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  LogoutRequest,
} from '@/types/auth.type';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', data);
    return response.data;
  },

  logout: async (data: LogoutRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/logout', data);
    return response.data;
  },
};
