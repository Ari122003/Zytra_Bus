// Driver status enum matching backend
export type DriverStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'BLOCKED' | 'DELETED';

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Registration request for driver
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// Login response (for existing active drivers)
export interface LoginResponse {
  message: string;
  status: DriverStatus;
  driverId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
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

// Driver data stored in context
export interface Driver {
  id: number | null;
  email: string;
  name?: string;
  phone?: string;
  imageUrl?: string;
  status: DriverStatus;
}

// Auth state
export interface AuthState {
  driver: Driver | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
