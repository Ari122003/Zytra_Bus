import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registrationSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const emailSchema = z.string().email("Invalid email address");

export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");
