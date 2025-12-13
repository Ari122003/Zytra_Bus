export interface LoginResponse {
  message: string;
}
export interface ErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  error: string;
  errors?: Record<string, string>;
}
