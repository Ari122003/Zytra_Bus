export type DriverStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'BLOCKED' | 'DELETED';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  message: string;
  status: DriverStatus;
  driverId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
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

export interface Driver {
  id: number | null;
  email: string;
  name?: string;
  phone?: string;
  imageUrl?: string;
  status: DriverStatus;
}

export interface AuthState {
  driver: Driver | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
