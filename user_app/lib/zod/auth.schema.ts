import { z } from "zod";

// Login/Sign Up Schema
export const loginSchema = z
	.object({
		email: z.string().email("Invalid email address"),
		phoneNumber: z
			.string()
			.regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
		dob: z
			.string()
			.refine((date) => {
				const dobDate = new Date(date);
				const today = new Date();
				const age = today.getFullYear() - dobDate.getFullYear();
				const monthDiff = today.getMonth() - dobDate.getMonth();
				if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
					return age - 1 >= 18;
				}
				return age >= 18;
			}, "You must be at least 18 years old"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[0-9]/, "Password must contain at least one number"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export type LoginFormData = z.infer<typeof loginSchema>;

// Add more auth schemas below
export const emailSchema = z.string().email("Invalid email address");

export const phoneSchema = z
	.string()
	.regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

export const dobSchema = z
	.string()
	.refine((date) => {
		const dobDate = new Date(date);
		const today = new Date();
		const age = today.getFullYear() - dobDate.getFullYear();
		const monthDiff = today.getMonth() - dobDate.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
			return age - 1 >= 18;
		}
		return age >= 18;
	}, "You must be at least 18 years old");

export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number");
