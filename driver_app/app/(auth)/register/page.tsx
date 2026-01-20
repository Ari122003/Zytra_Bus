"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, Lock, AlertCircle, Eye, EyeOff, User, Phone } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { registrationSchema, type RegistrationFormData } from "@/lib/zod";
import { useAuth } from "@/hooks/useAuth";
import { AxiosError } from "axios";
import type { ErrorResponse } from "@/types/auth.type";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");
    setIsSubmitting(true);

    try {
      // Validate form data
      const data = { name, email, phone, password, confirmPassword };
      const validatedData = registrationSchema.parse(data);

      // Call register API
      const response = await register(validatedData);

      if (response.status === 'ACTIVE') {
        // Successfully registered - navigate to home page
        router.push('/trips');
      } else if (response.status === 'PENDING_VERIFICATION') {
        setApiError("Your account is pending verification. Please contact support.");
      } else if (response.status === 'BLOCKED') {
        setApiError("Your account has been blocked. Please contact support.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: Partial<Record<keyof RegistrationFormData, string>> = {};
        error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof RegistrationFormData;
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
      } else if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ErrorResponse>;
        
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          
          if (errorData.errors) {
            const fieldErrors: Partial<Record<keyof RegistrationFormData, string>> = {};
            Object.entries(errorData.errors).forEach(([field, message]) => {
              fieldErrors[field as keyof RegistrationFormData] = message;
            });
            setErrors(fieldErrors);
          } else {
            setApiError(errorData.message || "An error occurred during registration");
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
    <div className="min-h-screen bg-linear-to-b from-muted to-background flex items-center justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">Z</span>
            </div>
            <span className="font-bold text-2xl text-primary">Zytra Bus Driver</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Register as a driver to get started
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-6 md:p-8">
          {/* API Error Message */}
          {apiError && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-red-700 dark:text-red-400">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-input border ${
                    errors.name ? "border-red-500" : "border-border"
                  } rounded-lg pl-10 pr-3 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.name ? "focus:ring-red-500" : "focus:ring-ring"
                  }`}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

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
                    errors.email ? "border-red-500" : "border-border"
                  } rounded-lg pl-10 pr-3 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.email ? "focus:ring-red-500" : "focus:ring-ring"
                  }`}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full bg-input border ${
                    errors.phone ? "border-red-500" : "border-border"
                  } rounded-lg pl-10 pr-3 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.phone ? "focus:ring-red-500" : "focus:ring-ring"
                  }`}
                  placeholder="Enter 10-digit phone number"
                  disabled={isSubmitting}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
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
                    errors.password ? "border-red-500" : "border-border"
                  } rounded-lg pl-10 pr-12 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.password ? "focus:ring-red-500" : "focus:ring-ring"
                  }`}
                  placeholder="Create a password"
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
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                Min 8 chars with uppercase, lowercase, number & special char
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-input border ${
                    errors.confirmPassword ? "border-red-500" : "border-border"
                  } rounded-lg pl-10 pr-12 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                    errors.confirmPassword ? "focus:ring-red-500" : "focus:ring-ring"
                  }`}
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isSubmitting}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 text-base font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting || authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>By creating an account, you agree to our</p>
          <div className="space-x-2 mt-1">
            <Link href="/terms" className="hover:text-primary underline">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-primary underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
