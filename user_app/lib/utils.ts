import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AxiosError } from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract a user-friendly error message from various error types
 * Handles Axios errors, standard Error objects, and unknown errors
 * @param error - The error to extract message from
 * @param fallbackMessage - Default message if no specific message found
 * @param showStatusCode - Whether to include HTTP status code in the message
 */
export function getErrorMessage(
  error: unknown, 
  fallbackMessage: string = 'An unexpected error occurred',
  showStatusCode: boolean = true
): string {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    let message = '';
    
    // Check for response data message (API error response)
    if (error.response?.data) {
      const data = error.response.data;
      
      // Handle different API error response formats
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
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your connection and try again.';
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your internet connection.';
    }
    
    // If we have a message from the API, use it with status code
    if (message) {
      if (showStatusCode && statusCode) {
        return `[${statusCode}] ${message}`;
      }
      return message;
    }
    
    // Handle HTTP status codes with default messages
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
    
    // Fall back to Axios error message
    return error.message || fallbackMessage;
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle unknown errors
  return fallbackMessage;
}
