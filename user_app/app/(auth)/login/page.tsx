"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, User } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [otpSent, setOtpSent] = useState(false);

	const handleGetOtp = () => {
		// Validate inputs
		if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
			alert("Please fill in all fields");
			return;
		}

		if (phoneNumber.length !== 10) {
			alert("Please enter a valid 10-digit phone number");
			return;
		}

		// Simulate OTP sending
		setOtpSent(true);
		console.log("OTP sent to:", phoneNumber);
		// Here you would call your API to send OTP
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
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleGetOtp();
						}}
						className="space-y-6">
						{/* First Name */}
						<div>
							<label
								htmlFor="firstName"
								className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								First Name
							</label>
							<div className="flex items-center gap-2 mt-2">
								<User size={18} className="text-primary" />
								<input
									id="firstName"
									type="text"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="Enter your first name"
								/>
							</div>
						</div>

						{/* Last Name */}
						<div>
							<label
								htmlFor="lastName"
								className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Last Name
							</label>
							<div className="flex items-center gap-2 mt-2">
								<User size={18} className="text-primary" />
								<input
									id="lastName"
									type="text"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="Enter your last name"
								/>
							</div>
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
										setPhoneNumber(
											e.target.value.replace(/\D/g, "").slice(0, 10)
										)
									}
									className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="Enter 10-digit phone number"
									maxLength={10}
								/>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								We&apos;ll send an OTP to this number
							</p>
						</div>

						{/* Get OTP Button */}
						<Button
							type="submit"
							className="w-full bg-primary hover:bg-primary/90 text-white py-2 text-lg font-semibold rounded-lg">
							Get OTP
						</Button>
					</form>

					{/* Status Message */}
					{otpSent && (
						<div className="mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
							<p className="text-sm text-green-700 dark:text-green-300">
								OTP sent to <span className="font-semibold">{phoneNumber}</span>
							</p>
						</div>
					)}
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
