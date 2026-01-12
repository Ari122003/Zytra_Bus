"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { loginSchema, type LoginFormData } from "@/lib/zod";
import { useAuth } from "@/hooks/useAuth";
import { AxiosError } from "axios";
import type { ErrorResponse } from "@/types/auth.type";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");
    setIsSubmitting(true);

    try {
      // Validate form data
      const data = { email, password };
      const validatedData = loginSchema.parse(data);

      // Call login API
      const response = await login(validatedData);

      if (response.status === 'ACTIVE') {
        // Successfully logged in
        sessionStorage.removeItem('redirectAfterLogin');
        router.push('/trips');
      } else if (response.status === 'BLOCKED') {
        setApiError("Your account has been blocked. Please contact support.");
      } else if (response.status === 'PENDING_VERIFICATION') {
        setApiError("Your account is pending verification. Please contact support.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof LoginFormData;
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
      } else if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ErrorResponse>;
        
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          
          if (errorData.errors) {
            const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
            Object.entries(errorData.errors).forEach(([field, message]) => {
              fieldErrors[field as keyof LoginFormData] = message;
            });
            setErrors(fieldErrors);
          } else {
            setApiError(errorData.message || "An error occurred during login");
          }
        } else if (axiosError.request) {
          setApiError("Network error. Please check your connection and try again.");
        } else {
          setApiError("An unexpected error occurred. Please try again.");
        }
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/5 flex items-center justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl">Z</span>
            </div>
            <span className="font-bold text-2xl text-primary">Zytra Bus Driver</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to manage your trips
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-xl shadow-xl border border-border p-6 md:p-8">
          {/* API Error Message */}
          {apiError && (
            <div className="mb-5 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-destructive mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-destructive-foreground">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-input border ${
                    errors.email ? "border-destructive" : "border-border"
                  } rounded-lg pl-10 pr-3 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.email ? "focus:ring-destructive" : "focus:ring-ring"
                  }`}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-input border ${
                    errors.password ? "border-destructive" : "border-border"
                  } rounded-lg pl-10 pr-12 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.password ? "focus:ring-destructive" : "focus:ring-ring"
                  }`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isSubmitting}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary font-semibold hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
