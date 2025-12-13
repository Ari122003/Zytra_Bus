import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Create base axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for auth endpoints (without interceptors)
export const axiosAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/auth",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authentication token here
    // const token = localStorage.getItem("accessToken");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle successful responses
    return response;
  },
  async (error: AxiosError) => {
    // Handle error responses
    // const originalRequest = error.config;
    
    // Token refresh logic can be added here
    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;
    //   try {
    //     const refreshToken = localStorage.getItem("refreshToken");
    //     // Call refresh token API
    //     // Update token
    //     // Retry original request
    //   } catch (refreshError) {
    //     // Redirect to login
    //     return Promise.reject(refreshError);
    //   }
    // }

    return Promise.reject(error);
  }
);

export default axiosInstance;
