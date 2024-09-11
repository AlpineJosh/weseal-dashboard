import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUpSchema = z.object({
  email: z
    .string()
    .email({
      message: "Invalid email address",
    })
    .endsWith("@weseal.com", {
      message: "Email must end with @weseal.com",
    }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
});
