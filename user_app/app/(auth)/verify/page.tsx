"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { registrationSchema, otpSchema } from "@/lib/zod";
import type { RegistrationFormData, OtpFormData } from "@/lib/zod";
import { AxiosError } from "axios";
import type { ErrorResponse } from "@/types/auth.type";

export default function VerifyPage() {
  const router = useRouter();
  const { verifyOtp, isLoading: authLoading } = useAuth();

  // Check if we have the required email in session
  useEffect(() => {
    const email = sessionStorage.getItem("verificationEmail");
    if (!email) {
      router.push("/login");
    }
  }, [router]);

  const [step, setStep] = useState<1 | 2>(1);
  
  // Form data
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  
  // Error states
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData | keyof OtpFormData, string>>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // OTP timer
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start the timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const focusInput = (index: number) => {
    const node = inputsRef.current[index];
    if (node) node.focus();
  };

  const handleChange = (idx: number, value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 1);
    const nextDigits = [...digits];
    nextDigits[idx] = clean;
    setDigits(nextDigits);
    if (clean && idx < 5) {
      focusInput(idx + 1);
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      focusInput(idx - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...digits];
    
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    
    setDigits(newDigits);
    const nextEmptyIndex = newDigits.findIndex((d) => !d);
    if (nextEmptyIndex !== -1) {
      focusInput(nextEmptyIndex);
    } else {
      focusInput(5);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError("");

    try {
      const email = sessionStorage.getItem("verificationEmail");
      const password = sessionStorage.getItem("verificationPassword");

      if (!email || !password) {
        router.push("/login");
        return;
      }

      // Validate form data
      const data = {
        name,
        email,
        phone,
        dob,
        password,
        confirmPassword: password, // Same as password since already validated in login
      };

      registrationSchema.parse(data);
      setStep(2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof RegistrationFormData, string>> = {};
        error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof RegistrationFormData;
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleOtpSubmit = async () => {
    setErrors({});
    setApiError("");
    setIsSubmitting(true);

    try {
      const otp = digits.join("");
      
      // Validate OTP
      otpSchema.parse({ otp });

      const email = sessionStorage.getItem("verificationEmail");
      const password = sessionStorage.getItem("verificationPassword");

      if (!email || !password) {
        router.push("/login");
        return;
      }

      // Call verify OTP API
      await verifyOtp({
        name,
        dob,
        phone,
        email,
        password,
        otp,
      });

      // Clear session storage
      sessionStorage.removeItem("verificationEmail");
      sessionStorage.removeItem("verificationPassword");

      // Success - redirect handled by AuthContext
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof OtpFormData, string>> = {};
        error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof OtpFormData;
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
      } else if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ErrorResponse>;
        
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;
          setApiError(errorData.message || "Invalid or expired OTP");
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

  const handleResendOtp = async () => {
    if (canResend) {
      setTimeLeft(300);
      setCanResend(false);
      setDigits(Array(6).fill(""));
      setErrors({});
      setApiError("");

      // Restart timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // TODO: Call resend OTP API if available
      // For now, just restart timer
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-muted to-background flex items-center justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <span className="font-bold text-2xl text-primary">Zytra Bus</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {step === 1 ? "Complete Your Profile" : "Verify Your Email"}
          </h1>
          <p className="text-muted-foreground">
            {step === 1
              ? "Please provide your details to continue"
              : `Enter the 6-digit code sent to ${sessionStorage.getItem("verificationEmail")}`}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
          {/* API Error Message */}
          {apiError && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-red-700 dark:text-red-400">{apiError}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleDetailsSubmit} className="space-y-5">
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
                      errors.name ? "focus:ring-red-500" : "focus:ring-primary"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
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
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className={`w-full bg-input border ${
                      errors.phone ? "border-red-500" : "border-border"
                    } rounded-lg pl-10 pr-3 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                      errors.phone ? "focus:ring-red-500" : "focus:ring-primary"
                    }`}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="dob"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                  <input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className={`w-full bg-input border ${
                      errors.dob ? "border-red-500" : "border-border"
                    } rounded-lg pl-10 pr-3 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
                      errors.dob ? "focus:ring-red-500" : "focus:ring-primary"
                    }`}
                  />
                </div>
                {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
                <p className="text-xs text-muted-foreground mt-1">You must be at least 18 years old</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 text-base font-semibold rounded-lg">
                Continue to OTP
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-4 text-center">
                  Enter Verification Code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputsRef.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-12 h-14 text-center text-xl font-bold border ${
                        errors.otp ? "border-red-500" : "border-border"
                      } rounded-lg focus:outline-none focus:ring-2 ${
                        errors.otp ? "focus:ring-red-500" : "focus:ring-primary"
                      } bg-input text-foreground`}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-xs text-red-500 mt-2 text-center">{errors.otp}</p>
                )}
              </div>

              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {timeLeft > 0 ? (
                    <>Time remaining: <span className="font-semibold text-foreground">{formatTime(timeLeft)}</span></>
                  ) : (
                    <span className="text-red-500">OTP expired</span>
                  )}
                </p>
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleOtpSubmit}
                disabled={digits.some((d) => !d) || isSubmitting || authLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 text-base font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting || authLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify & Complete Registration"
                )}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed">
                  {canResend ? "Resend OTP" : "Resend OTP"}
                </button>
              </div>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="w-full text-sm text-muted-foreground hover:text-foreground">
                ← Back to edit details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
