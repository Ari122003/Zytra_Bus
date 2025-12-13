"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Phone, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { loginSchema } from "@/lib/zod";
import type { LoginFormData } from "@/lib/zod";
import { useLogin } from "@/hooks/useAuth";
import { AxiosError } from "axios";
import type { ErrorResponse } from "@/types/auth.type";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [dob, setDob] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
	const [apiError, setApiError] = useState<string>("");

	const loginMutation = useLogin();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setApiError("");

		try {
			// Validate form data
			const data = {
				email,
				phoneNumber,
				dob,
				password,
				confirmPassword,
			};

			const validatedData = loginSchema.parse(data);

			// Call API with validated data
			await loginMutation.mutateAsync(validatedData, {
				onSuccess: (response) => {
					console.log("Login response:", response);
					// Store email for OTP verification page
					sessionStorage.setItem("verificationEmail", email);
					router.push("/verify");
				},
				onError: (error: AxiosError<ErrorResponse>) => {
					if (error.response?.data) {
						const errorData = error.response.data;
						
						// Handle field-specific errors
						if (errorData.errors) {
							const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
							Object.entries(errorData.errors).forEach(([field, message]) => {
								fieldErrors[field as keyof LoginFormData] = message;
							});
							setErrors(fieldErrors);
						} else {
							// Handle general error message
							setApiError(errorData.message || "An error occurred during login");
						}
					} else if (error.request) {
						// Network error
						setApiError("Network error. Please check your connection and try again.");
					} else {
						// Other errors
						setApiError("An unexpected error occurred. Please try again.");
					}
				},
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				// Handle validation errors
				const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
				error.issues.forEach((issue) => {
					const path = issue.path[0] as keyof LoginFormData;
					fieldErrors[path] = issue.message;
				});
				setErrors(fieldErrors);
			}
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-b from-muted to-background flex items-center justify-center px-4 py-12 md:py-20">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="text-center mb-8">
					<div className="flex items-center justify-center gap-2 mb-4">
						<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
							<span className="text-white font-bold text-xl">✓</span>
						</div>
						<span className="font-bold text-2xl text-primary">Zytra Bus</span>
					</div>
					<h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
						Welcome Back
					</h1>
					<p className="text-muted-foreground">
						Sign in to book your next journey
					</p>
				</div>

				{/* Login Card */}
				<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
					{/* API Error Message */}
					{apiError && (
						<div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
							<AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
							<p className="text-sm text-red-700 dark:text-red-400">{apiError}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Email */}
						<div>
							<label
								htmlFor="email"
								className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Email Address
							</label>
							<div className="flex items-center gap-2 mt-2">
								<Mail size={18} className="text-primary" />
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={`w-full bg-input border ${
										errors.email ? "border-red-500" : "border-border"
									} rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
										errors.email ? "focus:ring-red-500" : "focus:ring-primary"
									}`}
									placeholder="Enter your email"
								/>
							</div>
							{errors.email && (
								<p className="text-xs text-red-500 mt-1">{errors.email}</p>
							)}
						</div>

						{/* Phone Number */}
						<div>
							<label
								htmlFor="phoneNumber"
								className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Phone Number
							</label>
							<div className="flex items-center gap-2 mt-2">
								<Phone size={18} className="text-primary" />
								<input
									id="phoneNumber"
									type="tel"
									value={phoneNumber}
									onChange={(e) =>
										setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
									}
									className={`w-full bg-input border ${
										errors.phoneNumber ? "border-red-500" : "border-border"
									} rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
										errors.phoneNumber ? "focus:ring-red-500" : "focus:ring-primary"
									}`}
									placeholder="Enter 10-digit phone number"
									maxLength={10}
								/>
							</div>
							{errors.phoneNumber && (
								<p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
							)}
						</div>

						{/* Date of Birth */}
						<div>
							<label
								htmlFor="dob"
								className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Date of Birth
							</label>
							<div className="flex items-center gap-2 mt-2">
								<Calendar size={18} className="text-primary" />
								<input
									id="dob"
									type="date"
									value={dob}
									onChange={(e) => setDob(e.target.value)}
									className={`w-full bg-input border ${
										errors.dob ? "border-red-500" : "border-border"
									} rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
										errors.dob ? "focus:ring-red-500" : "focus:ring-primary"
									}`}
								/>
							</div>
							{errors.dob && (
								<p className="text-xs text-red-500 mt-1">{errors.dob}</p>
							)}
						</div>

						{/* Password */}
						<div>
							<label
								htmlFor="password"
								className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Password
							</label>
							<div className="flex items-center gap-2 mt-2">
								<Lock size={18} className="text-primary" />
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className={`w-full bg-input border ${
										errors.password ? "border-red-500" : "border-border"
									} rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
										errors.password ? "focus:ring-red-500" : "focus:ring-primary"
									}`}
									placeholder="Enter your password"
								/>
							</div>
							{errors.password && (
								<p className="text-xs text-red-500 mt-1">{errors.password}</p>
							)}
							<p className="text-xs text-muted-foreground mt-1">
								Must contain uppercase, lowercase, number, and be 8+ characters
							</p>
						</div>

						{/* Confirm Password */}
						<div>
							<label
								htmlFor="confirmPassword"
								className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Confirm Password
							</label>
							<div className="flex items-center gap-2 mt-2">
								<Lock size={18} className="text-primary" />
								<input
									id="confirmPassword"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className={`w-full bg-input border ${
										errors.confirmPassword ? "border-red-500" : "border-border"
									} rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 ${
										errors.confirmPassword ? "focus:ring-red-500" : "focus:ring-primary"
									}`}
									placeholder="Confirm your password"
								/>
							</div>
							{errors.confirmPassword && (
								<p className="text-xs text-red-500 mt-1">
									{errors.confirmPassword}
								</p>
							)}
						</div>

						{/* Submit Button */}
						<Button
							type="submit"
							disabled={loginMutation.isPending}
							className="w-full bg-primary hover:bg-primary/90 text-white py-2 text-lg font-semibold rounded-lg disabled:opacity-50">
							{loginMutation.isPending ? "Processing..." : "Sign Up"}
						</Button>
					</form>
				</div>

				{/* Footer */}
				<div className="mt-8 text-center text-xs text-muted-foreground">
					<p>By continuing, you agree to our</p>
					<div className="space-x-2 mt-1">
						<Link href="#" className="hover:text-primary">
							Terms of Service
						</Link>
						<span>•</span>
						<Link href="#" className="hover:text-primary">
							Privacy Policy
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
