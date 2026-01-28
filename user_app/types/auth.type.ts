export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'BLOCKED' | 'DELETED';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  status: UserStatus;
  userId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
}

export interface VerifyOtpRequest {
  name: string;
  dob: string;
  phone: string;
  email: string;
  password: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  error: string;
  errors?: Record<string, string>;
}

export interface User {
  id: number | null;
  email: string;
  name?: string;
  imageUrl?: string;
  status: UserStatus;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}



