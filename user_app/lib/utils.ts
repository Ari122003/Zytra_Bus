import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AxiosError } from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extracts user-friendly error messages from Axios errors, standard Errors, or unknown errors
// Handles API responses, network errors, and HTTP status codes with appropriate messages
export function getErrorMessage(
  error: unknown, 
  fallbackMessage: string = 'An unexpected error occurred',
  showStatusCode: boolean = true
): string {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    let message = '';
    
    if (error.response?.data) {
      const data = error.response.data;
      
      if (typeof data === 'string') {
        message = data;
      } else if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      } else if (data.errors && Array.isArray(data.errors)) {
        message = data.errors.join(', ');
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your connection and try again.';
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your internet connection.';
    }
    
    if (message) {
      if (showStatusCode && statusCode) {
        return `[${statusCode}] ${message}`;
      }
      return message;
    }
    
    if (statusCode) {
      let statusMessage = '';
      if (statusCode === 400) statusMessage = 'Bad request. Please check your input.';
      else if (statusCode === 401) statusMessage = 'Unauthorized. Please log in again.';
      else if (statusCode === 403) statusMessage = 'Access denied. You do not have permission.';
      else if (statusCode === 404) statusMessage = 'Resource not found.';
      else if (statusCode === 500) statusMessage = 'Server error. Please try again later.';
      else if (statusCode >= 500) statusMessage = 'Server is temporarily unavailable. Please try again later.';
      else statusMessage = error.message || fallbackMessage;
      
      if (showStatusCode) {
        return `[${statusCode}] ${statusMessage}`;
      }
      return statusMessage;
    }
    
    return error.message || fallbackMessage;
  }
  
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return fallbackMessage;
}
