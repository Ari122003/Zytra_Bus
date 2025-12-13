import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { authApi } from "@/lib/api";
import type { LoginFormData } from "@/lib/zod";
import type { LoginResponse, ErrorResponse } from "@/types/auth.type";

/**
 * Hook for login/registration mutation
 * @returns React Query mutation object
 */
export const useLogin = (): UseMutationResult<
  LoginResponse,
  AxiosError<ErrorResponse>,
  LoginFormData
> => {
  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: (data) => {
      console.log("Login successful:", data);
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};

/**
 * Hook for OTP verification mutation
 * @returns React Query mutation object
 */
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: { email: string; otp: string }) =>
      authApi.verifyOtp(data),
    onSuccess: (data) => {
      console.log("OTP verification successful:", data);
    },
    onError: (error) => {
      console.error("OTP verification error:", error);
    },
  });
};

/**
 * Hook for resending OTP
 * @returns React Query mutation object
 */
export const useResendOtp = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendOtp(email),
    onSuccess: (data) => {
      console.log("OTP resent successfully:", data);
    },
    onError: (error) => {
      console.error("Resend OTP error:", error);
    },
  });
};
