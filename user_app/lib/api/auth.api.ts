import { axiosAuth } from "./axios";
import type { LoginFormData } from "@/lib/zod";
import type { LoginResponse } from "@/types/auth.type";

/**
 * Auth API endpoints
 * Uses axiosAuth instance without interceptors
 */

export const authApi = {
  /**
   * Register/Login user
   * @param data - User registration/login data
   * @returns Promise with login response
   */
  login: async (email: string): Promise<LoginResponse> => {
    const response = await axiosAuth.post<LoginResponse>("/send-otp", email);
    return response.data;
  },

  /**
   * Verify OTP
   * @param data - OTP verification data
   * @returns Promise with verification response
   */
  verifyOtp: async ( data:LoginFormData):Promise<VerifyOtpResponse=> {
    const response = await axiosAuth.post<LoginFormData>("/verify-otp", data);
    return response.data;
  },

  /**
   * Resend OTP
   * @param email - User email
   * @returns Promise with resend response
   */
  resendOtp: async (email: string) => {
    const response = await axiosAuth.post("/auth/resend-otp", { email });
    return response.data;
  },
};
