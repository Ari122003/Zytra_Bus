// User status enum matching backend
export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'BLOCKED' | 'DELETED';

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response (for existing active users)
export interface LoginResponse {
  message: string;
  status: UserStatus;
  userId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
}

// OTP verification request
export interface VerifyOtpRequest {
  name: string;
  dob: string;
  phone: string;
  email: string;
  password: string;
  otp: string;
}

// Refresh token request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Logout request
export interface LogoutRequest {
  refreshToken: string;
}

// Error response from API
export interface ErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  error: string;
  errors?: Record<string, string>;
}

// User data stored in context
export interface User {
  id: number | null;
  email: string;
  name?: string;
  imageUrl?: string;
  status: UserStatus;
}
// Auth state
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}



